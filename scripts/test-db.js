const https = require('https');
const fs = require('fs');

// Read env vars from .env.local
const content = fs.readFileSync('.env.local', 'utf8');
const env = {};
content.split('\n').forEach(line => {
  line = line.trim();
  if (!line || line.startsWith('#')) return;
  const eqIdx = line.indexOf('=');
  if (eqIdx === -1) return;
  const key = line.substring(0, eqIdx);
  let val = line.substring(eqIdx + 1).trim();
  if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
  if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
  env[key] = val;
});

const SUPABASE_URL = (env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '');
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('URL:', SUPABASE_URL);
console.log('Key length:', SERVICE_KEY.length);
console.log('Key prefix:', SERVICE_KEY.substring(0, 8) + '...');

function apiCall(path, method, body, extraHeaders) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path: path,
      method: method,
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': 'Bearer ' + SERVICE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
        ...(extraHeaders || {})
      }
    };
    const data = body ? JSON.stringify(body) : null;
    if (data) options.headers['Content-Length'] = Buffer.byteLength(data);
    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', function(d) { responseBody += d; });
      res.on('end', function() {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseBody) });
        } catch(e) {
          resolve({ status: res.statusCode, data: responseBody });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  // Test: query branches table
  const result = await apiCall('/rest/v1/branches?select=*&limit=5');
  console.log('\n--- Test branches query ---');
  console.log('Status:', result.status);
  if (result.status === 200) {
    console.log('Branches count:', result.data.length);
    result.data.forEach(b => console.log(' -', b.name, '(' + b.slug + ')'));
    console.log('\nDatabase connection OK!');
  } else {
    console.log('Error:', JSON.stringify(result.data).substring(0, 300));
  }
}

main().catch(err => console.error('Fatal:', err.message));
