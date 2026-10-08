const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mysql = require('mysql2/promise');

async function check() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  console.log('Connected to MySQL successfully!\n');

  await conn.query('CREATE DATABASE IF NOT EXISTS hostel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await conn.query('USE hostel_db');
  console.log('Using database: hostel_db');

  await conn.query(`CREATE TABLE IF NOT EXISTS wardens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('chief_warden','hostel_warden','assistant_warden') NOT NULL DEFAULT 'hostel_warden',
    office_room VARCHAR(50),
    qualification VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  console.log('wardens table: OK');

  await conn.query(`CREATE TABLE IF NOT EXISTS hostels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    type ENUM('boys','girls') NOT NULL,
    total_floors INT NOT NULL DEFAULT 4,
    total_rooms INT NOT NULL DEFAULT 80,
    total_capacity INT NOT NULL DEFAULT 200,
    warden_id INT NULL,
    location_block VARCHAR(100),
    contact_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (warden_id) REFERENCES wardens(id) ON DELETE SET NULL
  )`);
  console.log('hostels table: OK');

  const [rows] = await conn.query('SELECT COUNT(*) as cnt FROM hostels');
  console.log('hostels row count:', rows[0].cnt);

  const [tables] = await conn.query('SHOW TABLES');
  console.log('All tables in hostel_db:', tables.map(t => Object.values(t)[0]).join(', '));

  await conn.end();
  console.log('\nAll good! MySQL is working correctly for the hostel system.');
}

check().catch(e => {
  console.error('\nERROR:', e.message);
  console.error('Code:', e.code, '| Errno:', e.errno);
});
