// Client-side login logic for static hosting environments (e.g. GitHub Pages)
// Fetch the CSV of users and validate the submitted credentials without a
// backend. This is intended only for simple demos as all credentials are
// exposed to the client.

const users = {};

// Load and parse the CSV file containing the user database
fetch('systemUserDB_clean.csv')
  .then(res => res.text())
  .then(text => {
    const lines = text.trim().split('\n');
    for (let i = 1; i < lines.length; i++) {
      const [username, password, role] = lines[i].split(',');
      users[username] = { password, role };
    }
  })
  .catch(err => {
    console.error('Failed to load user database:', err);
  });

// Handle the form submission client-side
function handleLogin(event) {
  event.preventDefault();
  const form = event.target;
  const username = form.username.value.trim();
  const password = form.password.value.trim();

  if (users[username] && users[username].password === password) {
    document.body.innerHTML = `<h1>Welcome, ${username}!</h1><p>Role: ${users[username].role}</p>`;
  } else {
    alert('Invalid username or password');
  }
}

document.getElementById('loginForm').addEventListener('submit', handleLogin);
