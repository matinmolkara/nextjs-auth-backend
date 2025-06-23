const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT || 5432,
  
  keepAlive: true, // جلوی قطع ناگهانی رو می‌گیره
});

pool
  .connect()
  .then(() => console.log("✅ successfully Connected PostgreSQL"))
  .catch((err) => console.error("❌ Error in connecting to database:", err));

module.exports = pool;
