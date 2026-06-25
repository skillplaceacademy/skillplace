const https = require('https');
const fs = require('fs');

// Read env vars
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

function sql(sqlText) {
  return apiCall('/rest/v1/rpc/exec_sql', 'POST', { query: sqlText });
}

async function main() {
  // Step 1: Create exec_sql function
  console.log('Creating exec_sql function...');
  const fnResult = await sql(`
    CREATE OR REPLACE FUNCTION exec_sql(query text)
    RETURNS void AS $$
    BEGIN
      EXECUTE query;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log('exec_sql function:', fnResult.status);
  if (fnResult.status >= 400) {
    // Try alternate creation method
    console.log('Note: Function may need superuser. Trying alternative...');
    // Actually for supabase, we need to use the SQL editor or migrations
    // Let's use a different approach: execute DDL via the REST API directly
  }
}

main().catch(err => console.error('Fatal:', err.message));
