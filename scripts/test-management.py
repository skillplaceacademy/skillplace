import urllib.request, json, ssl

# Read env
env = {}
with open('.env.local', 'r') as f:
    for line in f:
        line = line.strip().replace('\r', '')
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip("'")

service_key = env['SUPABASE_SERVICE_ROLE_KEY']
base_url = env['NEXT_PUBLIC_SUPABASE_URL']  # https://weebasgxtemffakbvcfa.supabase.co/rest/v1/

project_ref = base_url.split('//')[1].split('.')[0]
print(f'Project: {project_ref}')

# Try Supabase's pgquery endpoint (newer API)
# https://github.com/supabase/supabase/blob/master/api/src/routes/api/sql.ts
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Method 1: Try the new Platform API
sql = json.dumps({'query': 'SELECT count(*) as cnt FROM branches'}).encode()
req = urllib.request.Request(
    f'https://api.supabase.com/v1/projects/{project_ref}/database/query',
    data=sql,
    headers={
        'apikey': service_key,
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json',
        'Content-Length': len(sql),
        'Prefer': 'return=representation'
    },
    method='POST'
)
try:
    resp = urllib.request.urlopen(req, timeout=10, context=ctx)
    print('DB Query API - Status:', resp.status)
    print('Response:', resp.read().decode()[:300])
except Exception as e:
    print('DB Query API Error:', str(e)[:200])

# Method 2: Use the migrations API
# Create a migration
migration_name = 'full_rebuild'
req2 = urllib.request.Request(
    f'https://api.supabase.com/v1/projects/{project_ref}/migrations',
    data=json.dumps({'name': migration_name}).encode(),
    headers={
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json',
        'Content-Length': 20,
    },
    method='POST'
)
try:
    resp2 = urllib.request.urlopen(req2, timeout=10, context=ctx)
    print('Migration API - Status:', resp2.status)
    print('Response:', resp2.read().decode()[:300])
except Exception as e:
    print('Migration API Error:', str(e)[:200])
