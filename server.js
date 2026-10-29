import net from 'node:net';
// Allow normal connection latency before trying the next IPv4/IPv6 address.
net.setDefaultAutoSelectFamilyAttemptTimeout(3000);
import dotenv from 'dotenv';
dotenv.config({path:['.env.local','.env']});
import express from 'express';
import handler from './api/data.js';
import authHandler from './api/auth/[...path].js';
const app=express();
app.disable('x-powered-by');
app.use(express.json({limit:'8kb'}));
app.all('/api/data',handler);
app.all('/api/auth/{*path}',authHandler);
if(process.env.NODE_ENV==='production') {app.use(express.static('dist'));app.get('/{*path}',(req,res)=>res.sendFile('dist/index.html',{root:process.cwd()}));}
else {const {createServer}=await import('vite');const vite=await createServer({server:{middlewareMode:true},appType:'spa'});app.use(vite.middlewares);}
app.listen(Number(process.env.PORT)||5173,'0.0.0.0',()=>console.log('BroCD ready at http://localhost:'+(process.env.PORT||5173)));
