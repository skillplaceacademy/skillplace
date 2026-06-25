const { execSync } = require('child_process');
try {
  const result = execSync('npm list -g --depth=0', { encoding: 'utf8' });
  console.log(result);
} catch(e) {
  console.log('stdout:', e.stdout);
  console.log('stderr:', e.stderr.substring(0, 500));
}
