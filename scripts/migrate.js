import net from 'node:net';
net.setDefaultAutoSelectFamilyAttemptTimeout(3000);
import pg from 'pg';
import {readFile,readdir} from 'node:fs/promises';
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL?.replace('-pooler.', '.');
const client = new pg.Client({connectionString:url});
try { await client.connect(); for(const file of (await readdir(new URL('../migrations/',import.meta.url))).filter(f=>f.endsWith('.sql')).sort()) await client.query(await readFile(new URL('../migrations/'+file,import.meta.url),'utf8')); console.log('PASS: BroCD database migration applied.'); }
finally {await client.end();}
