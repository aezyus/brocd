import {createAuthServer,extractNeonAuthCookies,serializeSetCookie} from '@neondatabase/auth/server';
export function requestOrigin(req){return `${req.headers['x-forwarded-proto']||'http'}://${req.headers.host}`;}
export function appendCookie(res,value){const existing=res.getHeader('Set-Cookie');res.setHeader('Set-Cookie',[...(Array.isArray(existing)?existing:existing?[existing]:[]),value]);}
export async function getUser(req,res){
 if(!process.env.NEON_AUTH_BASE_URL || !process.env.NEON_AUTH_COOKIE_SECRET)return null;
 const cookies=extractNeonAuthCookies(req.headers.cookie||'');
 if(!cookies)return null;
 const auth=createAuthServer({baseUrl:process.env.NEON_AUTH_BASE_URL,cookieSecret:process.env.NEON_AUTH_COOKIE_SECRET,sessionDataTtl:1,sameSite:'strict',context:()=>({getCookies:()=>cookies,setCookie:(name,value,options)=>appendCookie(res,serializeSetCookie({name,value,...options})),getHeader:name=>req.headers[name.toLowerCase()]||null,getOrigin:()=>req.headers.origin||requestOrigin(req),getFramework:()=> 'express'})});
 const {data,error}=await auth.getSession();
 if(error){console.error('Account session check:',error.code,error.status,error.message?.slice(0,160));throw new Error('Account session unavailable');}
 return data?.user||null;
}
