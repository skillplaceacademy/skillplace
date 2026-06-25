import urllib.request, json, os, ssl

# Read env vars
env = {}
with open('.env.local', 'r') as f:
    for line in f:
        line = line.strip().replace('\r', '')
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            env[k.strip()] = v.strip().strip("'")

token = 'sbp_v0...3e11'
project_ref = env['NEXT_PUBLIC_SUPABASE_URL'].split('//')[1].split('.')[0]

print(f'Project ref: {project_ref}')
print(f'Token starts: {token[:8]}...')

# Try Management API
data = json.dumps({'query': 'SELECT count(*) as cnt FROM branches'}).encode()
req = urllib.request.Request(
    f'https://api.supabase.com/v1/projects/{project_ref}/sql',
    data=data,
    headers={
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    },
    method='POST'
)
ctx = ssl.create_default_context()
try:
    resp = urllib.request.urlopen(req, context=ctx)
    print('Status:', resp.status)
    print('Response:', resp.read().decode()[:500])
except urllib.error.HTTPError as e:
    print('HTTP Error:', e.code)
    body = e.read().decode()
    print('Body:', body[:500])
except Exception as e:
    print('Error:', str(e))
