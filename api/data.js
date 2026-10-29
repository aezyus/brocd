import {randomBytes, createHash} from 'node:crypto';
import {db} from '../lib/db.js';
import {themes} from '../lib/themes.js';
import {getUser,appendCookie} from '../lib/auth.js';
const hash = token => createHash('sha256').update(token).digest('hex');
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store');
 res.setHeader('X-Content-Type-Options','nosniff');
 if (!['GET','POST','DELETE'].includes(req.method)) return res.status(405).json({error:'Method not allowed'});
 if (req.method !== 'GET') {
  const origin = req.headers.origin;
  if (origin && new URL(origin).host !== req.headers.host) return res.status(403).json({error:'Request not allowed'});
  if (!req.headers['content-type']?.includes('application/json')) return res.status(415).json({error:'JSON required'});
 }
 try {
  const user=await getUser(req,res);
  if(!user)return res.status(401).json({error:'Please sign in to open your private journal.'});
  const cookie = req.headers.cookie?.split(';').map(v=>v.trim()).find(v=>v.startsWith('brocd_session='))?.slice(14);
  let visitor;
  if (cookie && /^[a-f0-9]{64}$/.test(cookie)) visitor = (await db().query('SELECT id FROM brocd_visitors WHERE token_hash=$1',[hash(cookie)])).rows[0];

  if (!visitor) {
   const token = randomBytes(32).toString('hex');
   visitor = (await db().query('INSERT INTO brocd_visitors(token_hash) VALUES($1) RETURNING id',[hash(token)])).rows[0];
   appendCookie(res,`brocd_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=31536000${process.env.VERCEL || process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
  }
  const owner=user?.id||visitor.id;
  const ownerWhere=user?'user_id=$1':'visitor_id=$1 AND user_id IS NULL';
  if(req.method==='GET') {
   const sessions = await db().query(`SELECT id,created_at,duration_seconds,theme,sleep,caffeine,environment,mood FROM brocd_sessions WHERE ${ownerWhere} ORDER BY created_at DESC LIMIT 1000`,[owner]);
   return res.status(200).json({sessions:sessions.rows,user:user?{id:user.id,name:user.name,email:user.email}:null});
  }
  if(req.method==='DELETE') {
   await db().query(`DELETE FROM brocd_sessions WHERE ${ownerWhere}`,[owner]);
   return res.status(200).json({deleted:true});
  }
  const b = req.body || {};
  if(b.action==='claim'){if(!user)return res.status(401).json({error:'Please sign in first.'});await db().query('UPDATE brocd_sessions SET user_id=$1 WHERE visitor_id=$2 AND user_id IS NULL',[user.id,visitor.id]);return res.status(200).json({claimed:true});}
  const allowed = {theme:themes,sleep:['Low','Okay','Rested'],caffeine:['None','Some','High'],environment:['Home','Work','Outside','In transit'],mood:['Tough','Uneasy','Okay','Good','Bright']};
  if (!uuid.test(b.id || '') || !Number.isInteger(b.duration_seconds) || b.duration_seconds<0 || b.duration_seconds>86400 || Object.entries(allowed).some(([key,values])=>b[key]!=null && !values.includes(b[key]))) return res.status(400).json({error:'Please check your session details.'});
  const result=await db().query('INSERT INTO brocd_sessions(id,visitor_id,duration_seconds,theme,sleep,caffeine,environment,mood,user_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(id) DO NOTHING RETURNING id',[b.id,visitor.id,b.duration_seconds,b.theme||null,b.sleep||null,b.caffeine||null,b.environment||null,b.mood||null,user?.id||null]);
  return res.status(200).json({saved:true,id:result.rows[0]?.id || b.id});
 } catch(err) { console.error('BroCD request failed:',err.code || err.name,err.message?.slice(0,160)); return res.status(503).json({error:'Your journal is unavailable right now. Please try again shortly.'}); }
}
