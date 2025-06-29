// backend/db.js
const mysql = require("mysql2/promise");
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // from .env
  database: process.env.DB_NAME, // from .env
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+05:30", // Ensure dates are handled in local timezone
});


db.getConnection()
  .then(() => console.log("✅ Connected to MySQL database."))
  .catch((err) => console.error("❌ MySQL connection error:", err));

module.exports = db;