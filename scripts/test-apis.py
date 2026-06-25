import urllib.request, json, ssl

# Read env vars
env = {}
with open('.env.local', 'r') as f:
    for line in f:
        line = line.strip().replace('\r', '')
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip("'")

service_key = env['SUPABASE_SERVICE_ROLE_KEY']
base_url = env['NEXT_PUBLIC_SUPABASE_URL']  # includes /rest/v1/ already

# Actually let's try: the Management API v2 uses service_role key
# Or let's try the supabase-connection-api

project_ref = base_url.split('//')[1].split('.')[0]
print(f'Project: {project_ref}')

# Try using the internal management API with service key
# Supabase has a hidden API at /api/projects/{ref}/sql that accepts service key
sql = json.dumps({'query': 'SELECT count(*) as cnt FROM branches'}).encode()
req = urllib.request.Request(
    f'https://{project_ref}.rest.cartridge.supabase.co/api/projects/{project_ref}/sql',
    data=sql,
    headers={
        'apikey': service_key,
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json',
    },
    method='POST'
)
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
try:
    resp = urllib.request.urlopen(req, timeout=10, context=ctx)
    print('Status:', resp.status)
    print('Response:', resp.read().decode()[:300])
except Exception as e:
    print('Error1:', str(e)[:200])

# Try the Supabase Dashboard API
# The dashboard uses a different endpoint
sql2 = json.dumps({'query': 'SELECT count(*) as cnt FROM branches'}).encode()
req2 = urllib.request.Request(
    f'https://supabase.com/api/projects/{project_ref}/sql',
    data=sql2,
    headers={
        'apikey': service_key,
        'Authorization': f'Bearer {service_key}',
        'Content-Type': 'application/json',
    },
    method='POST'
)
try:
    resp2 = urllib.request.urlopen(req2, timeout=10, context=ctx)
    print('Status2:', resp2.status)
    print('Response2:', resp2.read().decode()[:300])
except Exception as e:
    print('Error2:', str(e)[:200])
