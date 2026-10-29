import {handleAuthProxyRequest} from '@neondatabase/auth/server';
import {requestOrigin} from '../lib/auth.js';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(!process.env.NEON_AUTH_BASE_URL||!process.env.NEON_AUTH_COOKIE_SECRET)return res.status(503).json({message:'Account sign-in is not configured yet.'});
 if(!['GET','POST'].includes(req.method))return res.status(405).json({message:'Method not allowed'});
 try{
  if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return res.status(403).json({message:'Request not allowed'});
  const origin=requestOrigin(req);
  const url=new URL(req.originalUrl||req.url,origin);
  // Vercel rewrites nested auth paths to this explicit function.
  const path=url.searchParams.get('authPath')||req.query?.authPath||url.pathname.replace(/^\/api\/auth\/?/,'');
  if(typeof path!=='string'||! /^[a-z0-9-]+(?:\/[a-z0-9-]+)*$/i.test(path))return res.status(404).json({message:'Not found'});
  url.pathname='/api/auth/'+path;
  url.searchParams.delete('authPath');
  const headers=new Headers();
  for(const [key,value]of Object.entries(req.headers)){if(value&& !['host','content-length','connection'].includes(key))headers.set(key,Array.isArray(value)?value.join(', '):value);}
  if(req.method==='POST'&&!headers.get('content-type')?.includes('application/json'))return res.status(415).json({message:'JSON required'});
  const request=new Request(url,{method:req.method,headers,...(req.method==='POST'?{body:JSON.stringify(req.body||{})}:{})});
  const response=await handleAuthProxyRequest({request,path,baseUrl:process.env.NEON_AUTH_BASE_URL,cookieSecret:process.env.NEON_AUTH_COOKIE_SECRET,sessionDataTtl:1,sameSite:'strict'});
  for(const key of ['content-type','location']){const v=response.headers.get(key);if(v)res.setHeader(key,v);}
  const cookies=response.headers.getSetCookie();if(cookies.length)res.setHeader('Set-Cookie',cookies);
  return res.status(response.status).send(await response.text());
 }catch(e){console.error('Account request failed:',e.code||e.name);return res.status(503).json({message:'Sign-in is unavailable right now. Please try again.'});}
}
