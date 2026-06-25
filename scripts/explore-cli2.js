const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/lapi/AppData/Roaming/npm/node_modules/@supabase';
try {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  console.log('Entries:');
  entries.forEach(e => console.log(' ', e.name, e.isDirectory() ? '(dir)' : ''));
} catch(e) {
  console.error('Error:', e.message);
}
