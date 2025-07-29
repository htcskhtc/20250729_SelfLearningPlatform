const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

const users = {};
const data = fs.readFileSync(path.join(__dirname, 'systemUserDB.csv'), 'utf8').trim().split('\n');
for (let i = 1; i < data.length; i++) {
  const [username, password, role] = data[i].split(',');
  users[username] = { password, role };
}

const server = http.createServer((req, res) => {
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
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const parsed = querystring.parse(body);
      const { username, password } = parsed;
      if (users[username] && users[username].password === password) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<h1>Welcome, ${username}</h1>`);
      } else {
        res.writeHead(401, { 'Content-Type': 'text/html' });
        res.end('<h1>Login failed</h1>');
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
