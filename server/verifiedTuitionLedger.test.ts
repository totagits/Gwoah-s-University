import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Operations} from './operations';
import os from 'node:os';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

test('Finance tab exclusively renders the authenticated ledger, not legacy AI Studio tuition simulation',()=>{
  const app=fs.readFileSync(path.join(root,'src/App.tsx'),'utf8');
  const ui=fs.readFileSync(path.join(root,'src/components/portal/VerifiedTuitionLedger.tsx'),'utf8');
  assert.match(app,/<VerifiedTuitionLedger currentUser=\{currentUser\} \/>/);
  assert.doesNotMatch(app,/<FinanceBursarModule /);
  assert.match(ui,/fetch\('\/api\/workspaces\/state'/);
  assert.match(ui,/fetch\('\/api\/workspaces\/action'/);
  for(const action of ['invoice','payment','reconcilePayment'])assert.ok(ui.includes("'"+action+"'"));
  assert.doesNotMatch(ui,/u-student|\/api\/finance\/pay|\/api\/finance\/student/);
  assert.match(ui,/does not decrease confirmed outstanding balances/);
  assert.match(ui,/not a live MTN, Orange Money, or bank payment gateway/);
});

test('partial tuition evidence only reduces balance after independent reconciliation; credit notes are accounted for',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hiau-finance-test-'));
  const db=new Operations(dir);
  const actor=(id:string,role:string)=>({id,role} as any);
  const rootUser=actor('admin','super_admin');
  const bursar1=actor('bursar-a','bursar');
  const bursar2=actor('bursar-b','bursar');
  const student=actor('student','student');
  const lecturer=actor('lecturer','lecturer');
  try{
    db.saveUsers([rootUser,bursar1,bursar2,student,lecturer].map(u=>({...u,name:u.id,email:u.id+'@example.test'})));
    const run=(act:string,data:any)=>db.execute(rootUser,act,data);
    const program=run('program',{code:'FIN',title:'Finance fixture',requiredCredits:3});
    const term=run('term',{code:'FIN26',title:'Finance test term',startDate:'2026-09-01',endDate:'2026-12-31',status:'open',maxCredits:12});
    const course=run('course',{code:'FIN101',title:'Test course',credits:3,feePerCredit:'20.00',programId:program.id});
    const section=run('section',{courseId:course.id,termId:term.id,lecturerId:lecturer.id,code:'A',capacity:10,location:'Room 1',schedule:'Monday'});
    const application=run('application',{fullName:'Student',email:'student@example.test',programId:program.id});
    run('reviewApplication',{id:application.id,status:'approved',note:'Test'});
    const profile=run('admit',{applicationId:application.id,studentNumber:'FIN0001',termId:term.id});
    assert.equal(profile.user_id,student.id);
    const reg=db.execute(student,'register',{sectionId:section.id});
    assert.equal(reg.status,'enrolled');
    const invoice=db.execute(bursar1,'invoice',{studentId:profile.id,termId:term.id,dueDate:'2026-11-30'});
    assert.equal(invoice.amount_cents,6000);
    assert.equal(db.invoiceBalance(invoice.id),6000);
    const evidence=db.execute(bursar1,'payment',{invoiceId:invoice.id,amount:'20.00',reference:'FIN-TEST-1',method:'mobile_money',receivedDate:'2026-11-09'});
    assert.equal(evidence.status,'recorded');
    assert.equal(db.invoiceBalance(invoice.id),6000,'unreconciled evidence must not reduce invoice');
    assert.throws(()=>db.execute(bursar1,'reconcilePayment',{id:evidence.id,status:'reconciled',note:'Self approval'}),/second bursar/i);
    assert.throws(()=>db.execute(student,'reconcilePayment',{id:evidence.id,status:'reconciled',note:'Wrong role'}),/role/i);
    db.execute(bursar2,'reconcilePayment',{id:evidence.id,status:'reconciled',note:'Independently verified against sandbox evidence'});
    assert.equal(db.invoiceBalance(invoice.id),4000,'only the verified partial payment reduces outstanding');
    assert.throws(()=>db.execute(bursar1,'payment',{invoiceId:invoice.id,amount:'40.01',reference:'FIN-TEST-OVER',method:'bank',receivedDate:'2026-11-09'}),/balance/);
    db.execute(student,'drop',{id:reg.id,reason:'Test course withdrawal'});
    assert.equal(db.invoiceBalance(invoice.id),-2000,'credit note and reconciled payment can yield credit balance requiring authorized resolution');
    assert.equal(db.all('SELECT * FROM credit_notes WHERE invoice_id=?',invoice.id).length,1);
  }finally{db.close();fs.rmSync(dir,{recursive:true,force:true});}
});
