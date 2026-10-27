import nodemailer from 'nodemailer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export function integrationStatus() {
  return {
    email: {
      configured: !!(
        (process.env.SMTP_HOST &&
          process.env.SMTP_USER &&
          process.env.SMTP_PASSWORD &&
          process.env.MAIL_FROM) ||
        (process.env.RESEND_API_KEY &&
          (process.env.MAIL_FROM || process.env.BILLING_FROM))
      ),
      provider: process.env.SMTP_HOST
        ? 'SMTP'
        : process.env.RESEND_API_KEY
          ? 'Resend'
          : 'Not connected',
      required: [
        'SMTP_HOST',
        'SMTP_PORT',
        'SMTP_USER',
        'SMTP_PASSWORD',
        'MAIL_FROM',
        'or RESEND_API_KEY and MAIL_FROM',
      ],
    },
    backups: {
      configured: !!(
        process.env.S3_BUCKET &&
        process.env.S3_ACCESS_KEY_ID &&
        process.env.S3_SECRET_ACCESS_KEY
      ),
      provider: 'S3-compatible storage',
      required: [
        'S3_BUCKET',
        'S3_REGION',
        'S3_ACCESS_KEY_ID',
        'S3_SECRET_ACCESS_KEY',
        'S3_ENDPOINT (for R2/MinIO)',
      ],
    },
    ai: {
      configured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_MODEL),
      provider: 'Gemini',
      required: ['GEMINI_API_KEY', 'GEMINI_MODEL'],
    },
    calendar: {
      configured: !!(
        process.env.CALDAV_URL &&
        process.env.CALDAV_USERNAME &&
        process.env.CALDAV_PASSWORD
      ),
      provider: 'CalDAV',
      required: ['CALDAV_URL', 'CALDAV_USERNAME', 'CALDAV_PASSWORD'],
    },
    recording: {
      configured: !!process.env.LECTURE_CAPTURE_TOKEN,
      provider: 'Signed recording webhook',
      required: ['LECTURE_CAPTURE_TOKEN'],
    },
    occupancy: {
      configured: !!process.env.OCCUPANCY_FEED_TOKEN,
      provider: 'Signed occupancy webhook',
      required: ['OCCUPANCY_FEED_TOKEN'],
    },
  };
}
export async function sendMail(
  to: string,
  subject: string,
  text: string,
  idempotency?: string,
) {
  const from = process.env.MAIL_FROM || process.env.BILLING_FROM;
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    from
  ) {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      requireTLS: process.env.SMTP_SECURE !== 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      connectionTimeout: 15000,
      socketTimeout: 20000,
    });
    const result = await transport.sendMail({ from, to, subject, text });
    if (!result.accepted.length)
      throw Error('Mail server did not accept the recipient.');
    return { provider: 'SMTP', accepted: true };
  }
  if (process.env.RESEND_API_KEY && from) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        ...(idempotency ? { 'Idempotency-Key': idempotency } : {}),
      },
      body: JSON.stringify({ from, to: [to], subject, text }),
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok)
      throw Error(`Email provider rejected the request (${response.status}).`);
    return { provider: 'Resend', accepted: true };
  }
  throw Error('Email is not connected. Configure SMTP or Resend in Coolify.');
}
export function createBackupVault(directory: string) {
  const root = path.join(directory, 'encrypted-backups');
  fs.mkdirSync(root, { recursive: true });
  const keyPath = path.join(root, '.key');
  if (!fs.existsSync(keyPath))
    fs.writeFileSync(keyPath, crypto.randomBytes(32), {
      mode: 0o600,
      flag: 'wx',
    });
  const key = fs.readFileSync(keyPath);
  if (key.length !== 32) throw Error('Backup encryption key is invalid.');
  const encrypt = (data: unknown) => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([
      cipher.update(JSON.stringify(data), 'utf8'),
      cipher.final(),
    ]);
    return {
      format: 'gwoah-backup-v1',
      iv: iv.toString('base64'),
      tag: cipher.getAuthTag().toString('base64'),
      ciphertext: ciphertext.toString('base64'),
    };
  };
  const decrypt = (envelope: any) => {
    if (
      envelope?.format !== 'gwoah-backup-v1' ||
      typeof envelope.ciphertext !== 'string' ||
      envelope.ciphertext.length > 100000000
    )
      throw Error('Invalid backup format.');
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(envelope.iv, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(envelope.tag, 'base64'));
    return JSON.parse(
      Buffer.concat([
        decipher.update(Buffer.from(envelope.ciphertext, 'base64')),
        decipher.final(),
      ]).toString('utf8'),
    );
  };
  const save = async (data: unknown) => {
    const id = crypto.randomUUID();
    const body = JSON.stringify(encrypt(data));
    fs.writeFileSync(path.join(root, id + '.json'), body, {
      mode: 0o600,
      flag: 'wx',
    });
    let cloud = 'Not connected — encrypted local copy saved';
    if (integrationStatus().backups.configured) {
      try {
        const endpoint = process.env.S3_ENDPOINT;
        if (endpoint && !endpoint.startsWith('https://'))
          throw Error('Cloud storage endpoint must use HTTPS.');
        const client = new S3Client({
          region: process.env.S3_REGION || 'auto',
          ...(endpoint ? { endpoint } : {}),
          forcePathStyle: process.env.S3_PATH_STYLE === 'true',
          credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY_ID!,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
          },
          maxAttempts: 2,
        });
        await client.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: `university-backups/${id}.json`,
            Body: body,
            ContentType: 'application/json',
            ...(process.env.S3_KMS_KEY_ID
              ? {
                  ServerSideEncryption: 'aws:kms',
                  SSEKMSKeyId: process.env.S3_KMS_KEY_ID,
                }
              : {}),
          }),
        );
        cloud = 'Encrypted backup uploaded';
      } catch {
        cloud = 'Cloud upload failed — encrypted local copy remains available';
      }
    }
    return {
      id,
      cloud,
      sha256: crypto.createHash('sha256').update(body).digest('hex'),
      createdAt: new Date().toISOString(),
    };
  };
  const read = (id: string) => {
    if (!/^[a-f0-9-]{36}$/.test(id)) throw Error('Invalid snapshot ID.');
    return fs.readFileSync(path.join(root, id + '.json'), 'utf8');
  };
  return { save, read, decrypt };
}
