import net from 'node:net';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import express from 'express';
import handler from '../api/auth.js';
net.setDefaultAutoSelectFamilyAttemptTimeout(3000);
const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url)));
assert.deepEqual(config.rewrites[0],{source:'/api/auth/:path*',destination:'/api/auth?authPath=:path*'});
const app=express();app.use(express.json());app.all('/api/auth',handler);app.all('/api/auth/{*path}',handler);
const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base=`http://localhost:${server.address().port}`;
try{
 for(const path of ['/api/auth/get-session','/api/auth?authPath=get-session']){const r=await fetch(base+path);assert.equal(r.status,200,path);assert.equal(await r.json(),null);}
 console.log('PASS: Session checks work through original and Vercel-rewritten URLs.');
 for(const route of ['sign-up/email','sign-in/email'])for(const path of [`/api/auth/${route}`,`/api/auth?authPath=${route}`]){
  const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:'{}'});assert.ok([400,422].includes(r.status),`${path}: expected input validation, got ${r.status}`);
 }
 console.log('PASS: Nested signup and login reach Neon validation through both routes (no accounts created).');
 const invalid=await fetch(base+'/api/auth?authPath=../admin');assert.equal(invalid.status,404);
 console.log('PASS: Invalid rewritten paths are rejected.');
}finally{server.close();}
