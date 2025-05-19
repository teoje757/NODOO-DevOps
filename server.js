const express = require('express');  // Import Express
const app = express();              // Create an Express app

// Define a route for the homepage ("/")
app.get('/', (req, res) => {
  res.send('NODOO To-Do App');     // Send text response
});

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
}

// Add this line at the end of server.js
module.exports = app;
