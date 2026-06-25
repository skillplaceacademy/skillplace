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

// Supavisor connection pooler
// Region: ap-south-1 (Mumbai) - check your project region
const regions = ['aws-ap-southeast-1', 'aws-ap-northeast-1', 'aws-us-east-1', 'aws-eu-west-1'];

async function tryConnect(region) {
  const connectionString = `postgresql://postgres.${projectRef}:***@${region}.pooler.supabase.com:6543/postgres`;
  const client = new Client({ connectionString, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    const result = await client.query('SELECT count(*) as cnt FROM branches');
    console.log(`SUCCESS with region ${region}! Branches:`, result.rows[0].cnt);
    await client.end();
    return true;
  } catch (err) {
    console.log(`${region}: ${err.code || err.message.substring(0, 50)}`);
    try { await client.end(); } catch(e) {}
    return false;
  }
}

async function main() {
  for (const region of regions) {
    if (await tryConnect(region)) return;
  }
  console.log('\nNone of the default regions worked. Check your Supabase project region.');
}

main();
