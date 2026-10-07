require('dotenv').config();
const mysql = require('mysql2/promise');

async function renameHostels() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hostel_db'
  });

  const updates = [
    [1, 'Sukhmani Boys Hostel'],
    [2, 'Sukhsagar Boys Hostel'],
    [3, 'Sadbhawna Boys Hostel'],
    [4, 'Shantikunj Boys Hostel'],
    [5, 'Kalpana Girls Hostel']
  ];

  const wardenUpdates = [
    [2, 'warden.sukhmani@campus.edu', 'Sukhmani Hall #G02'],
    [3, 'warden.sukhsagar@campus.edu', 'Sukhsagar Hall #G02'],
    [4, 'warden.sadbhawna@campus.edu', 'Sadbhawna Hall #G02'],
    [5, 'warden.shantikunj@campus.edu', 'Shantikunj Hall #G02'],
    [6, 'warden.kalpana@campus.edu', 'Kalpana Hall #G01']
  ];

  console.log('Renaming hostels in MySQL...');
  for (const [id, name] of updates) {
    await conn.query('UPDATE hostels SET name = ? WHERE id = ?', [name, id]);
    console.log(`  ✓ Hostel ${id} → ${name}`);
  }

  console.log('\nUpdating warden emails & office rooms...');
  for (const [id, email, office] of wardenUpdates) {
    await conn.query('UPDATE wardens SET email = ?, office_room = ? WHERE id = ?', [email, office, id]);
    console.log(`  ✓ Warden ${id} → ${email} | ${office}`);
  }

  const [rows] = await conn.query('SELECT id, name, code FROM hostels ORDER BY id');
  console.log('\nVerified hostel names in MySQL:');
  rows.forEach(r => console.log(`  [${r.code}] ${r.name}`));

  await conn.end();
  console.log('\nDone! All hostel names updated successfully.');
}

renameHostels().catch(e => console.error('Error:', e.message));
