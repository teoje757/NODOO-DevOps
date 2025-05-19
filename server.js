const express = require('express');  // Import Express
const app = express();              // Create an Express app

// Define a route for the homepage ("/")
app.get('/', (req, res) => {
  res.send('NODOO To-Do App');     // Send text response
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server running on port 3000');
});