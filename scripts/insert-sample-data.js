
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
  // Insert sample students
  const students = [
    { email: 'rahul.sharma@example.com', full_name: 'Rahul Sharma', phone: '9876543210', program_type: 'online', branch_id: '79d1fc92-c561-4063-a83b-b1212461c933', batch_id: 'a35cdda9-2b88-44f5-80db-b2b0ec7d0d18' },
    { email: 'priya.patel@example.com', full_name: 'Priya Patel', phone: '9876543211', program_type: 'offline', branch_id: '3cafd78a-3af9-44e7-a739-a7a653b4cacc', batch_id: 'a35cdda9-2b88-44f5-80db-b2b0ec7d0d18' },
    { email: 'amit.kumar@example.com', full_name: 'Amit Kumar', phone: '9876543212', program_type: 'hybrid', branch_id: '50b4c1c1-6329-47fe-b017-53746a5dccaf', batch_id: null },
    { email: 'sneha.reddy@example.com', full_name: 'Sneha Reddy', phone: '9876543213', program_type: 'online', branch_id: '06c7e929-0938-4cc4-b392-2debd26f77a3', batch_id: null },
    { email: 'vikram.singh@example.com', full_name: 'Vikram Singh', phone: '9876543214', program_type: 'offline', branch_id: '79d1fc92-c561-4063-a83b-b1212461c933', batch_id: 'a35cdda9-2b88-44f5-80db-b2b0ec7d0d18' },
  ];

  const createdStudents = [];
  for (const s of students) {
    const result = await query('/rest/v1/students', 'POST', JSON.stringify(s));
    console.log('CREATE STUDENT:', result.status, result.data.substring(0, 100));
    if (result.status === 201) {
      try {
        const parsed = JSON.parse(result.data);
        createdStudents.push(parsed[0]);
      } catch(e) {}
    }
  }

  // Insert sample enrollments
  if (createdStudents.length > 0) {
    const enrollments = [
      { user_id: createdStudents[0].id, program_id: 'd61983c8-793c-4375-a734-66539d8e684e', branch_id: '79d1fc92-c561-4063-a83b-b1212461c933', status: 'active', program_type: 'online' },
      { user_id: createdStudents[1].id, program_id: '53b1e536-c985-47ba-ab47-d7efa04f25d6', branch_id: '3cafd78a-3af9-44e7-a739-a7a653b4cacc', status: 'pending', program_type: 'offline' },
      { user_id: createdStudents[2].id, program_id: '834abc1a-5b11-45e3-bbe1-0e01154ae435', branch_id: '50b4c1c1-6329-47fe-b017-53746a5dccaf', status: 'active', program_type: 'hybrid' },
      { user_id: createdStudents[3].id, program_id: 'd61983c8-793c-4375-a734-66539d8e684e', branch_id: '06c7e929-0938-4cc4-b392-2debd26f77a3', status: 'completed', program_type: 'online' },
      { user_id: createdStudents[4].id, program_id: '53b1e536-c985-47ba-ab47-d7efa04f25d6', branch_id: '79d1fc92-c561-4063-a83b-b1212461c933', status: 'pending', program_type: 'offline' },
    ];

    for (const e of enrollments) {
      const result = await query('/rest/v1/enrollments', 'POST', JSON.stringify(e));
      console.log('CREATE ENROLLMENT:', result.status, result.data.substring(0, 100));
    }
  }
}

main().catch(e => console.log('ERROR:', e.message));
