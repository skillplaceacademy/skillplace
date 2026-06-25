
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
      res.on('end', () => resolve({status: res.statusCode, data: data}));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  // Get the students we just created
  const studentsResp = await query('/rest/v1/students?select=id,email,full_name,phone,is_active,program_type&limit=5');
  const students = JSON.parse(studentsResp.data);
  console.log('STUDENTS:', students.length);

  // Create profiles for each student (same ID)
  for (const s of students) {
    const profileData = {
      id: s.id,
      email: s.email,
      full_name: s.full_name,
      phone: s.phone,
      role: 'student',
      is_active: s.is_active,
      program_type: s.program_type,
    };
    const result = await query('/rest/v1/profiles', 'POST', JSON.stringify(profileData));
    console.log('CREATE PROFILE:', result.status, s.email);
  }

  // Get programs and branches
  const programsResp = await query('/rest/v1/training_programs?select=id,name&limit=5');
  const programs = JSON.parse(programsResp.data);
  
  const branchesResp = await query('/rest/v1/branches?select=id,name&limit=5');
  const branches = JSON.parse(branchesResp.data);

  // Create enrollments
  const enrollments = [
    { user_id: students[0].id, program_id: programs[0].id, branch_id: branches[0].id, status: 'active', program_type: 'online' },
    { user_id: students[1].id, program_id: programs[1].id, branch_id: branches[1].id, status: 'pending', program_type: 'offline' },
    { user_id: students[2].id, program_id: programs[2].id, branch_id: branches[2].id, status: 'active', program_type: 'hybrid' },
    { user_id: students[3].id, program_id: programs[0].id, branch_id: branches[3 % branches.length].id, status: 'completed', program_type: 'online' },
    { user_id: students[4].id, program_id: programs[1].id, branch_id: branches[0].id, status: 'pending', program_type: 'offline' },
  ];

  for (const e of enrollments) {
    const result = await query('/rest/v1/enrollments', 'POST', JSON.stringify(e));
    console.log('CREATE ENROLLMENT:', result.status, result.data.substring(0, 80));
  }
}

main().catch(e => console.log('ERROR:', e.message));
