
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');

const host = process.env.DB_HOST || '127.0.0.1';
const port = parseInt(process.env.DB_PORT || '3306', 10);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'hostel_db';

async function main() {
  let conn;
  try {
    conn = await mysql.createConnection({ host, port, user, password, database });
  } catch (err) {
    console.error(`\n[ERROR] Could not connect to MySQL (${err.code || err.message}).`);
    console.error(`Check DB_PASSWORD in server/.env and verify MySQL81 is running.\n`);
    process.exit(1);
  }

  const queryArg = process.argv.slice(2).join(' ').trim();

  // Mode 1: Run query directly from arguments (e.g. node query.js "SELECT * FROM hostels")
  if (queryArg) {
    await executeQuery(conn, queryArg);
    await conn.end();
    return;
  }

  // Mode 2: Interactive SQL terminal prompt
  console.log(`\n======================================================`);
  console.log(` AuraHostel Interactive MySQL Console (${database})`);
  console.log(` Connected to: ${user}@${host}:${port}`);
  console.log(` Type your SQL query and press Enter. Type "exit" or "quit" to leave.`);
  console.log(`======================================================\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${database}> `
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    if (!input) {
      rl.prompt();
      return;
    }
    if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
      await conn.end();
      process.exit(0);
    }
    await executeQuery(conn, input);
    rl.prompt();
  });

  rl.on('close', async () => {
    await conn.end();
    process.exit(0);
  });
}

async function executeQuery(conn, sql) {
  try {
    const cleanSql = sql.endsWith(';') ? sql.slice(0, -1) : sql;
    const [rows, fields] = await conn.query(cleanSql);
    if (Array.isArray(rows)) {
      if (rows.length === 0) {
        console.log(`(0 rows returned)\n`);
      } else {
        console.table(rows);
        console.log(`(${rows.length} row${rows.length === 1 ? '' : 's'} returned)\n`);
      }
    } else {
      console.log(`Query OK, ${rows.affectedRows || 0} row(s) affected.\n`);
    }
  } catch (err) {
    console.error(`SQL Error: ${err.message}\n`);
  }
}

main();
