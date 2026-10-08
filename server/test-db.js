const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');

const testPassword = process.argv[2] !== undefined ? process.argv[2] : (process.env.DB_PASSWORD || '');
const host = process.env.DB_HOST || '127.0.0.1';
const port = parseInt(process.env.DB_PORT || '3306', 10);
const user = process.env.DB_USER || 'root';

async function testCurrentConfig() {
  console.log(`\n--- MySQL Connection Test ---`);
  console.log(`Target: ${user}@${host}:${port}`);
  console.log(`Testing password: ${testPassword === '' ? '(empty)' : '********'}`);

  try {
    const conn = await mysql.createConnection({
      host,
      port,
      user,
      password: testPassword,
      connectTimeout: 3000
    });

    const [rows] = await conn.query('SELECT VERSION() as version');
    console.log(`\n SUCCESS! Successfully authenticated to MySQL Server.`);
    console.log(` MySQL Version: ${rows[0].version}`);
    await conn.end();
    console.log(`Your .env configuration is valid and ready to use.\n`);
    process.exit(0);
  } catch (err) {
    console.log(`\n FAILED: ${err.code || err.message}`);
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log(`Reason: Incorrect password for user '${user}'.`);
      console.log(`Tip: If you know the password, update DB_PASSWORD in .env or run: node test-db.js <password>`);
    } else if (err.code === 'ECONNREFUSED') {
      console.log(`Reason: Could not reach MySQL at ${host}:${port}. Ensure the MySQL81 Windows service is running.`);
    }
    process.exit(1);
  }
}

testCurrentConfig();
