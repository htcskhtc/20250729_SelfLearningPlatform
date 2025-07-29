const fs = require('fs');
const path = require('path');

// Test CSV reading
const users = {};
const data = fs.readFileSync(path.join(__dirname, 'systemUserDB.csv'), 'utf8').trim().split('\n');
console.log('Raw data:', JSON.stringify(data));
console.log('Data length:', data.length);

for (let i = 1; i < data.length; i++) {
  console.log(`Processing line ${i}:`, JSON.stringify(data[i]));
  const [username, password, role] = data[i].split(',');
  console.log('Parsed:', { username, password, role });
  users[username] = { password, role };
}

console.log('Final users object:', users);

// Test the specific credentials
const testUsername = 'Teacher1';
const testPassword = 'RCSS';

console.log('\nTesting login:');
console.log('Test username:', testUsername);
console.log('Test password:', testPassword);
console.log('User exists:', !!users[testUsername]);
if (users[testUsername]) {
  console.log('Stored password:', users[testUsername].password);
  console.log('Password match:', users[testUsername].password === testPassword);
}
