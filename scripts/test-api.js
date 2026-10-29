import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://localhost:5173';
for(const method of ['GET','POST','DELETE']){
 const r=await fetch(base+'/api/data',{method,headers:{'Content-Type':'application/json'},...(method==='POST'?{body:JSON.stringify({id:crypto.randomUUID(),duration_seconds:30})}:{})});
 assert.equal(r.status,401,`${method} must require an account`);
}
console.log('PASS: Read, save, and delete are blocked without login.');
const forged=await fetch(base+'/api/data',{headers:{Cookie:'brocd_session='+('a'.repeat(64))}});assert.equal(forged.status,401);
console.log('PASS: A forged guest cookie cannot access account data.');
for(const path of ['/','/manifest.webmanifest','/sw.js','/icon-192.png','/icon-512.png','/images/forest.jpg','/images/nature.jpg','/images/meditating.svg','/font.ttf']){
 const r=await fetch(base+path);assert.equal(r.status,200,path);
 if(path.endsWith('.svg'))assert.match(r.headers.get('content-type'),/svg/);
 if(path.endsWith('.png')||path.endsWith('.jpg'))assert.match(r.headers.get('content-type'),/image/);
}
console.log('PASS: Public page, PWA assets, images, and font are served correctly.');
