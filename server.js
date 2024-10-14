// server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(express.json());

// Create a connection to the database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password', // Update with your password
  database: 'your_database_name', // Update with your database name
});

// Endpoint to execute SQL queries
app.post('/execute-query', (req, res) => {
  const { query } = req.body;
  db.query(query, (error, results) => {
    if (error) return res.status(500).json({ error });
    res.json(results);
  });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
