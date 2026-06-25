const fs = require('fs');
const content = fs.readFileSync('C:/Users/lapi/AppData/Roaming/npm/node_modules/supabase/dist/supabase.js', 'utf8');
// Search for token validation
const lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('sbp_') || line.includes('Invalid') || line.includes('token')) {
    console.log(`L${i+1}: ${line.substring(0, 150)}`);
  }
});
