import net from 'node:net';
import {spawnSync} from 'node:child_process';
import {db} from '../lib/db.js';
net.setDefaultAutoSelectFamilyAttemptTimeout(3000);
// Only reserved example.com identities created by this project's end-to-end test.
const {rows}=await db().query('SELECT id FROM neon_auth."user" WHERE name=$1 AND email ~ $2',['BroCD QA','^brocd[.]qa[.](other[.])?[0-9]{13}@example[.]com$']);
let deleted=0;
for(const row of rows){
 await db().query('DELETE FROM brocd_sessions WHERE user_id=$1',[row.id]);
 const result=spawnSync('npx',['neon@latest','neon-auth','user','delete',row.id],{encoding:'utf8',timeout:30000,stdio:['ignore','pipe','pipe']});
 if(result.status!==0){console.error('Could not delete one QA identity via the managed API.');process.exitCode=1;continue;}
 deleted++;
}
console.log(`QA cleanup: removed ${deleted} of ${rows.length} synthetic test accounts.`);
