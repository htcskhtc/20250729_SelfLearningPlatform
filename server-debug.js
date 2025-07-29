const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const users = {};

// Try to read the clean CSV file first, fallback to original
let csvFile = 'systemUserDB_clean.csv';
if (!fs.existsSync(path.join(__dirname, csvFile))) {
  csvFile = 'systemUserDB.csv';
}

const data = fs.readFileSync(path.join(__dirname, csvFile), 'utf8').trim().split('\n');
console.log('CSV file used:', csvFile);
console.log('CSV data loaded:', data);

for (let i = 1; i < data.length; i++) {
  const line = data[i].replace(/\r/g, '').trim(); // Remove carriage returns and trim
  if (line) { // Skip empty lines
    const [username, password, role] = line.split(',');
    users[username.trim()] = { password: password.trim(), role: role.trim() };
  }
}
console.log('Users loaded:', users);

const server = http.createServer((req, res) => {
  console.log(`\n=== Incoming Request ===`);
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  
  // Add CORS headers to prevent any browser issues
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method === 'GET' && req.url === '/') {
    console.log('Serving index.html');
    fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
      if (err) {
        console.error('Error reading index.html:', err);
        res.writeHead(500);
        res.end('Server error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
  } else if (req.method === 'GET' && req.url === '/test') {
    console.log('Serving test-login.html');
    fs.readFile(path.join(__dirname, 'test-login.html'), (err, content) => {
      if (err) {
        console.error('Error reading test-login.html:', err);
        res.writeHead(500);
        res.end('Server error');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
  } else if (req.method === 'POST' && (req.url === '/login' || req.url === '/login/')) {
    console.log('*** Processing login request ***');
    let body = '';
    req.on('data', chunk => { 
      body += chunk.toString(); 
    });
    req.on('end', () => {
      try {
        console.log('Request body received:', JSON.stringify(body));
        console.log('Request body length:', body.length);
        
        const parsed = querystring.parse(body);
        console.log('Parsed form data:', parsed);
        
        const { username, password } = parsed;
        console.log('Extracted credentials:');
        console.log('  Username:', JSON.stringify(username));
        console.log('  Password:', JSON.stringify(password));
        console.log('Available users:', Object.keys(users));
        
        // Debug the specific user lookup
        if (users[username]) {
          console.log('User found:', username);
          console.log('Stored password:', JSON.stringify(users[username].password));
          console.log('Provided password:', JSON.stringify(password));
          console.log('Password match:', users[username].password === password);
        } else {
          console.log('User NOT found:', username);
          console.log('Available usernames:', Object.keys(users));
        }
        
        if (users[username] && users[username].password === password) {
          console.log('*** LOGIN SUCCESSFUL ***');
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`<h1>Welcome, ${username}!</h1><p>Role: ${users[username].role}</p><p><a href="/">Back to login</a></p>`);
        } else {
          console.log('*** LOGIN FAILED ***');
          res.writeHead(401, { 'Content-Type': 'text/html' });
          res.end('<h1>Login failed</h1><p>Invalid username or password</p><p><a href="/">Try again</a></p>');
        }
      } catch (error) {
        console.error('Error processing login:', error);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>Server Error</h1><p>An error occurred processing your request</p>');
      }
    });
  } else {
    console.log('*** Route not matched ***');
    console.log('Method:', req.method);
    console.log('URL:', JSON.stringify(req.url));
    console.log('URL length:', req.url.length);
    
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`<h1>404 - Page Not Found</h1><p>Requested: ${req.method} ${req.url}</p><p>URL debug: ${JSON.stringify(req.url)}</p><p><a href="/">Go to homepage</a></p>`);
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}/`);
  console.log(`📋 Test page available at http://localhost:${PORT}/test`);
  console.log(`👥 Available users:`, Object.keys(users));
  console.log(`🔧 Use Ctrl+C to stop the server\n`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Try stopping other servers or use a different port.`);
  }
});
