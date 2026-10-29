import {neon} from '@neondatabase/serverless';
let client;
export function db() {
 if(!process.env.DATABASE_URL) throw new Error('Database is not configured');
 if(!client) {
  const sql=neon(process.env.DATABASE_URL);
  client={query:(text,params=[])=>sql.query(text,params,{fullResults:true,fetchOptions:{signal:AbortSignal.timeout(15000)}})};
 }
 return client;
}
