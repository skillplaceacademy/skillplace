const { Client } = require('pg');
const fs = require('fs');

const content = fs.readFileSync('.env.local', 'utf8');
const env = {};
content.split('\n').forEach(line => {
  line = line.trim().replace('\r', '');
  if (!line || line.startsWith('#')) return;
  const eqIdx = line.indexOf('=');
  if (eqIdx === -1) return;
  const key = line.substring(0, eqIdx);
  let val = line.substring(eqIdx + 1).trim();
  if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
  env[key] = val;
});

const projectRef = (env.NEXT_PUBLIC_SUPABASE_URL || '').split('//')[1].split('.')[0];
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || '';

// Try with connection timeout
const connectionString = `postgresql://postgres:***@${projectRef}.supabase.co:5432/postgres`;

async function main() {
  const client = new Client({ 
    connectionString,
    connectionTimeoutMillis: 10000,
    statement_timeout: 5000
  });
  
  try {
    await client.connect();
    console.log('Connected!');
    const result = await client.query('SELECT 1 as test');
    console.log('Query result:', result.rows[0].test);
    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Code:', err.code);
    console.error('Detail:', err.detail);
  }
}

main();
