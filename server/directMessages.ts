import type { Express } from 'express';
import crypto from 'node:crypto';
import { actorOf } from './identity';
import type { Operations } from './operations';

const roles = new Set(['super_admin','registrar','dean','lecturer','bursar','admissions_officer','student']);
/** Real per-recipient internal messages. No demo user ids, client-supplied sender identity, or simulated delivery. */
export function installDirectMessages(app: Express, store: Operations) {
  store.sql.exec(`CREATE TABLE IF NOT EXISTS direct_messages (
    id TEXT PRIMARY KEY, sender_id TEXT NOT NULL REFERENCES users(id),
    recipient_id TEXT NOT NULL REFERENCES users(id),
    subject TEXT NOT NULL, content TEXT NOT NULL,
    created_at TEXT NOT NULL
  ); CREATE INDEX IF NOT EXISTS idx_dm_recipient ON direct_messages(recipient_id,created_at);
  CREATE INDEX IF NOT EXISTS idx_dm_sender ON direct_messages(sender_id,created_at);`);
  const permitted = (res: any) => { const actor = actorOf(res); return actor && roles.has(actor.role) ? actor : null; };
  app.get('/api/directory/messaging-recipients', (_req, res) => {
    const actor = permitted(res);
    if (!actor) return res.status(403).json({error:'Messaging access denied.'});
    const users = store.all('SELECT id,name,role,title,department FROM users WHERE id <> ? ORDER BY name',actor.id);
    return res.json({users});
  });
  app.get('/api/messages', (_req, res) => {
    const actor = permitted(res);
    if (!actor) return res.status(403).json({error:'Messaging access denied.'});
    const rows = store.all(`SELECT m.id,m.sender_id AS senderId,m.recipient_id AS recipientId,
      s.name AS senderName,s.role AS senderRole,r.name AS recipientName,
      m.subject,m.content,m.created_at AS timestamp
      FROM direct_messages m JOIN users s ON s.id=m.sender_id
      JOIN users r ON r.id=m.recipient_id
      WHERE m.sender_id=? OR m.recipient_id=? ORDER BY m.created_at DESC LIMIT 200`,actor.id,actor.id);
    return res.json({messages:rows});
  });
  app.post('/api/messages', (req,res) => {
    const actor = permitted(res);
    if (!actor) return res.status(403).json({error:'Messaging access denied.'});
    const recipientId = typeof req.body?.recipientId==='string'?req.body.recipientId:'';
    const subject = typeof req.body?.subject==='string'?req.body.subject.trim():'';
    const content = typeof req.body?.content==='string'?req.body.content.trim():'';
    if(!recipientId || !subject || subject.length>160 || !content || content.length>5000)
      return res.status(400).json({error:'Choose a recipient and enter a subject (max 160) and message (max 5000).'});
    if(recipientId===actor.id) return res.status(400).json({error:'Choose another recipient.'});
    const recipient=store.one('SELECT id,name,role FROM users WHERE id=?',recipientId);
    if(!recipient || !roles.has(String(recipient.role)))
      return res.status(400).json({error:'The recipient is not available. Refresh the recipient list.'});
    try {
      const id=crypto.randomUUID(),timestamp=new Date().toISOString();
      store.run('INSERT INTO direct_messages(id,sender_id,recipient_id,subject,content,created_at) VALUES(?,?,?,?,?,?)',id,actor.id,recipientId,subject,content,timestamp);
      store.audit(actor.id,'DIRECT_MESSAGE_SENT','direct_messages',null,{id,recipientId});
      return res.status(201).json({success:true,message:{id,senderId:actor.id,senderName:actor.name,senderRole:actor.role,recipientId,recipientName:recipient.name,subject,content,timestamp}});
    } catch {
      return res.status(500).json({error:'The message could not be saved. Please retry.'});
    }
  });
}
