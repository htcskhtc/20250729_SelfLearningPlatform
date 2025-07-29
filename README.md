# 20250729_SelfLearningPlatform

This project contains a simple Node.js server that allows users to log in based on credentials stored in `systemUserDB.csv`.

If you want to host the project on a static service such as GitHub Pages where server side code cannot run, use the `index.html` page together with the `login.js` script. The script loads `systemUserDB_clean.csv` in the browser and performs the credential check client-side.

## Setup and run

No external dependencies are required. Run the server with Node:

```bash
node index.js
```

Then visit `http://localhost:3000` in your browser to access the login page.
