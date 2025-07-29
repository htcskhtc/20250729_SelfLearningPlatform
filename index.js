const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const users = {};
const data = fs.readFileSync(path.join(__dirname, 'systemUserDB.csv'), 'utf8').trim().split('\n');
console.log('CSV data loaded:', data);
for (let i = 1; i < data.length; i++) {
  const [username, password, role] = data[i].split(',');
  users[username] = { password, role };
}
console.log('Users loaded:', users);

const server = http.createServer((req, res) => {
  console.log(`Incoming ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  
  // Add CORS headers to prevent any browser issues
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method === 'GET' && req.url === '/') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
  } else if (req.method === 'POST' && req.url === '/login') {
    console.log('Processing login request');
    let body = '';
    req.on('data', chunk => { 
      body += chunk.toString(); 
    });
    req.on('end', () => {
      try {
        console.log('Request body:', body);
        const parsed = querystring.parse(body);
        const { username, password } = parsed;
        console.log('Parsed credentials:', { username, password });
        console.log('Available users:', Object.keys(users));
        
        if (users[username] && users[username].password === password) {
          console.log('Login successful for:', username);
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`<h1>Welcome, ${username}!</h1><p>Role: ${users[username].role}</p>`);
        } else {
          console.log('Login failed for:', username);
          console.log('Expected password:', users[username] ? users[username].password : 'User not found');
          res.writeHead(401, { 'Content-Type': 'text/html' });
          res.end('<h1>Login failed</h1><p>Invalid username or password</p>');
        }
      } catch (error) {
        console.error('Error processing login:', error);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>Server Error</h1><p>An error occurred processing your request</p>');
      }
    });
  } else {
    console.log('Unmatched route:', req.method, req.url);
    console.log('Request headers:', req.headers);
    
    // Check if it's a login-related request that didn't match
    if (req.url.includes('login')) {
      console.log('Login-related request detected but not matched');
      if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'text/html' });
        res.end('<h1>405 - Method Not Allowed</h1><p>Login requires POST method</p>');
        return;
      }
    }
    
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`<h1>404 - Page Not Found</h1><p>Requested: ${req.method} ${req.url}</p>`);
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
