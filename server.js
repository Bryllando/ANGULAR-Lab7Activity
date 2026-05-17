const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the Angular app build directory
app.use(express.static(path.join(__dirname, 'dist/ipt-2026-frontend')));

// For all GET requests, send back index.html so that PathLocationStrategy can be used
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist/ipt-2026-frontend/index.html'));
});

app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});
