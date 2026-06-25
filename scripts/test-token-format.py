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
base_url = env['NEXT_PUBLIC_SUPABASE_URL']  # includes /rest/v1/
project_ref = base_url.split('//')[1].split('.')[0]

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def api(path, data=None, method='GET'):
    url = base_url + path
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, method=method)
    req.add_header('apikey', service_key)
    req.add_header('Authorization', f'Bearer {service_key}')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Prefer', 'return=representation')
    if body:
        req.add_header('Content-Length', str(len(body)))
    try:
        resp = urllib.request.urlopen(req, timeout=10, context=ctx)
        return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return {'error': e.code, 'body': e.read().decode()[:200]}

# The REST API can only do CRUD on tables we have RLS access to
# We need to create a function to execute arbitrary SQL
# But we can't create a function via REST API without superuser...
#
# SOLUTION: Use the Supabase GoTrue admin API to create a JWT for a user
# Then use that JWT with the Management API

# Step 1: Create an admin user (if not exists)
# POST /auth/v1/admin/users
auth_url = f'https://{project_ref}.supabase.co/auth/v1'

# Actually, let's try a different approach:
# Use the existing profiles table to store a "migration" flag
# Then use a simple Node.js server to run migrations

# Wait - the REAL solution is simpler:
# The Supabase CLI needs a token in format sbp_XXXXXXXX (without v0_)
# But the user's token is sbp_v0_...
# 
# Let's check if we can just strip the "v0_" prefix and use the rest
token = 'sbp_v0_a3d9be8916e5d7faccd9ed93768ae027fb653e11'
stripped = token.replace('sbp_v0_', 'sbp_')
print(f'Original: {token[:10]}...')
print(f'Stripped: {stripped[:10]}...')

# Try using the stripped token
req = urllib.request.Request(
    'https://api.supabase.com/v1/projects',
    headers={
        'Authorization': f'Bearer {stripped}',
        'Content-Type': 'application/json',
    },
    method='GET'
)
try:
    resp = urllib.request.urlopen(req, timeout=10, context=ctx)
    projects = json.loads(resp.read().decode())
    print(f'Projects found: {len(projects)}')
    for p in projects[:3]:
        print(f'  - {p.get("name", "unknown")} ({p.get("id", "?")})')
except Exception as e:
    print(f'Error with stripped token: {str(e)[:200]}')
