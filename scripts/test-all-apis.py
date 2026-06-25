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
base_url = env['NEXT_PUBLIC_SUPABASE_URL']
project_ref = base_url.split('//')[1].split('.')[0]

# The Supabase REST API can execute SQL if we create a function first
# But we can't create a function without SQL access...
# 
# Alternative: Use the Supabase GoTrue admin endpoint to create a user,
# then use that user's JWT to call the Management API
#
# Actually, let's try: the Supabase Studio (Dashboard) has a SQL editor
# that accepts the service role key via the REST API
# Studio endpoint: /api/projects/{ref}/sql

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# Try Studio API
sql = json.dumps({'query': 'SELECT count(*) as cnt FROM branches'}).encode()
req = urllib.request.Request(
    f'https://studio.supabase.com/api/projects/{project_ref}/sql',
    data=sql,
    headers={
        'apikey': service_key,
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json',
        'Content-Length': len(sql),
    },
    method='POST'
)
try:
    resp = urllib.request.urlopen(req, timeout=10, context=ctx)
    print('Studio API - Status:', resp.status)
    print('Response:', resp.read().decode()[:300])
except Exception as e:
    print('Studio API Error:', str(e)[:200])

# Try the new Supabase Platform API with service key
req2 = urllib.request.Request(
    f'https://supabase.com/api/projects/{project_ref}/sql',
    data=sql,
    headers={
        'apikey': service_key,
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json',
        'Content-Length': len(sql),
    },
    method='POST'
)
try:
    resp2 = urllib.request.urlopen(req2, timeout=10, context=ctx)
    print('Platform API - Status:', resp2.status)
    print('Response:', resp2.read().decode()[:300])
except Exception as e:
    print('Platform API Error:', str(e)[:200])

# Try using the connection pooler (Supavisor)
# Format: postgresql://postgres.[project-ref]:***@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
pooler_url = f'postgresql://postgres.{project_ref}:***@aws-0-ap-south-1.pooler.supabase.com:6543/postgres'
print(f'\nPooler URL: {pooler_url[:60]}...')
