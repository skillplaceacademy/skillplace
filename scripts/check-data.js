
const fs = require('fs');
const content = fs.readFileSync('.env.local', 'utf8');
const lines = content.split('\n');
let serviceKey = '';
let supabaseUrl = '';
for (const l of lines) {
  const trimmed = l.trim();
  if (trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) serviceKey = trimmed.split('=').slice(1).join('=').trim();
  if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = trimmed.split('=').slice(1).join('=').trim();
}

const https = require('https');
const urlObj = new URL(supabaseUrl);

function query(path, method, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: urlObj.hostname,
      path: path,
      method: method || 'GET',
      headers: {
        'apikey': serviceKey,
        'Authorization': 'Bearer ' + serviceKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({status: res.statusCode, data: data.substring(0, 500)}));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // First, get existing branches and batches
  const branches = await query('/rest/v1/branches?select=id,name&limit=5');
  console.log('BRANCHES:', branches.data.substring(0, 300));
  
  const batches = await query('/rest/v1/batches?select=id,name&limit=5');
  console.log('BATCHES:', batches.data.substring(0, 300));

  const programs = await query('/rest/v1/training_programs?select=id,name&limit=5');
  console.log('PROGRAMS:', programs.data.substring(0, 300));

  const profiles = await query('/rest/v1/profiles?select=id,email,full_name&role=eq.student&limit=5');
  console.log('PROFILES:', profiles.data.substring(0, 300));
}

main().catch(e => console.log('ERROR:', e.message));
