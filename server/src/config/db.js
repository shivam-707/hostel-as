const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const { memoryStore, generateRoomsAndBeds, INITIAL_HOSTELS, INITIAL_WARDENS, INITIAL_STUDENTS, INITIAL_FEES, INITIAL_COMPLAINTS, INITIAL_GATE_PASSES, INITIAL_MESS_MENU } = require('./data-store');

let pool = null;
let isConnectedToMySQL = false;
let dbErrorReason = 'Initializing...';

let dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hostel_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function initMySQL(customConfig = null) {
  if (customConfig) {
    dbConfig = { ...dbConfig, ...customConfig };
  }

  // If in cloud/Vercel environment without a dedicated remote DB_HOST, use instant memory engine
  const isCloudEnv = Boolean(process.env.VERCEL);
  const isLocalHost = !process.env.DB_HOST || dbConfig.host === '127.0.0.1' || dbConfig.host === 'localhost';
  if (isCloudEnv && isLocalHost && !customConfig) {
    isConnectedToMySQL = false;
    dbErrorReason = 'Cloud deployment without remote DB_HOST. Running with Persistent Campus Data Store.';
    console.log(`[DB] ${dbErrorReason}`);
    return { success: false, message: dbErrorReason };
  }

  try {
    // First try connecting to MySQL server to ensure DB exists
    const serverConn = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      connectTimeout: 3000
    });

    console.log(`[DB] Connected to MySQL Server at ${dbConfig.host}:${dbConfig.port}`);
    await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await serverConn.end();

    // Now initialize pool with the specific database
    if (pool) {
      await pool.end().catch(() => {});
    }

    pool = mysql.createPool(dbConfig);
    const testConn = await pool.getConnection();
    await testConn.ping();
    testConn.release();

    isConnectedToMySQL = true;
    dbErrorReason = null;
    console.log(`[DB] Connected successfully to MySQL database "${dbConfig.database}"!`);

    // Ensure schema and seed
    await setupSchemaAndSeed();
    return { success: true, message: `Connected to MySQL: ${dbConfig.database}` };
  } catch (err) {
    isConnectedToMySQL = false;
    dbErrorReason = `${err.code || err.message}`;
    console.warn(`[DB] MySQL connection notice (${dbErrorReason}). Running with Persistent Campus Data Store.`);
    return { success: false, message: dbErrorReason };
  }
}

async function setupSchemaAndSeed() {
  if (!isConnectedToMySQL || !pool) return;
  try {
    // Run each DDL statement individually for safety
    const ddlStatements = [
      `CREATE TABLE IF NOT EXISTS wardens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        role ENUM('chief_warden','hostel_warden','assistant_warden') NOT NULL DEFAULT 'hostel_warden',
        office_room VARCHAR(50),
        qualification VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS hostels (
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
      )`,
      `CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hostel_id INT NOT NULL,
        room_number VARCHAR(10) NOT NULL,
        floor_number INT NOT NULL,
        room_type ENUM('2_seater','3_seater') NOT NULL,
        climate_type ENUM('ac','non_ac') NOT NULL,
        capacity INT NOT NULL,
        occupied_beds INT NOT NULL DEFAULT 0,
        status ENUM('available','full','maintenance') DEFAULT 'available',
        fee_per_semester DECIMAL(10,2) NOT NULL DEFAULT 35000.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_hostel_room (hostel_id, room_number),
        FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS beds (
        id INT AUTO_INCREMENT PRIMARY KEY,
        room_id INT NOT NULL,
        hostel_id INT NOT NULL,
        bed_letter CHAR(1) NOT NULL,
        status ENUM('vacant','occupied','reserved') DEFAULT 'vacant',
        student_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_room_bed (room_id, bed_letter),
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        roll_number VARCHAR(30) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        gender ENUM('male','female') NOT NULL,
        department VARCHAR(100) NOT NULL,
        year_of_study INT NOT NULL DEFAULT 1,
        guardian_name VARCHAR(100) NOT NULL,
        guardian_phone VARCHAR(20) NOT NULL,
        blood_group VARCHAR(10),
        address TEXT,
        hostel_id INT NULL,
        room_id INT NULL,
        bed_id INT NULL,
        admission_date DATE NOT NULL,
        status ENUM('active','graduated','suspended') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE SET NULL,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
        FOREIGN KEY (bed_id) REFERENCES beds(id) ON DELETE SET NULL
      )`,
      // Circular FK: beds.student_id -> students — only add if not exists
      `ALTER TABLE beds ADD CONSTRAINT fk_bed_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL`,
      `CREATE TABLE IF NOT EXISTS allocations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        hostel_id INT NOT NULL,
        room_id INT NOT NULL,
        bed_id INT NOT NULL,
        allocated_date DATE NOT NULL,
        vacated_date DATE NULL,
        status ENUM('active','transferred','vacated') DEFAULT 'active',
        remarks VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
        FOREIGN KEY (bed_id) REFERENCES beds(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS fee_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        semester VARCHAR(30) NOT NULL,
        fee_type VARCHAR(50) DEFAULT 'Hostel & Mess Fee',
        total_amount DECIMAL(10,2) NOT NULL,
        paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        due_amount DECIMAL(10,2) NOT NULL,
        due_date DATE NOT NULL,
        status ENUM('paid','partial','pending') DEFAULT 'pending',
        payment_method VARCHAR(50),
        transaction_ref VARCHAR(100),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS complaints (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        hostel_id INT NOT NULL,
        room_id INT NOT NULL,
        category ENUM('electrical','plumbing','carpentry','wifi','cleaning','other') NOT NULL,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        priority ENUM('low','medium','high','emergency') DEFAULT 'medium',
        status ENUM('open','in_progress','resolved','closed') DEFAULT 'open',
        assigned_to VARCHAR(100),
        resolution_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP NULL,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
        FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
      )`,
      `CREATE TABLE IF NOT EXISTS gate_passes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        hostel_id INT NOT NULL,
        destination VARCHAR(150) NOT NULL,
        reason TEXT NOT NULL,
        out_time DATETIME NOT NULL,
        expected_in_time DATETIME NOT NULL,
        actual_in_time DATETIME NULL,
        status ENUM('pending','approved','rejected','checked_out','returned') DEFAULT 'pending',
        approved_by_warden_id INT NULL,
        guard_notes VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by_warden_id) REFERENCES wardens(id) ON DELETE SET NULL
      )`,
      `CREATE TABLE IF NOT EXISTS mess_menu (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hostel_type ENUM('all','boys','girls') DEFAULT 'all',
        day_of_week ENUM('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
        meal_type ENUM('breakfast','lunch','snacks','dinner') NOT NULL,
        items TEXT NOT NULL,
        timing VARCHAR(50) NOT NULL,
        is_special BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('admin','chief_warden','warden','student') NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        ref_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const stmt of ddlStatements) {
      try {
        await pool.query(stmt);
      } catch (e) {
        // Silently ignore: duplicate constraint (1826), already exists (1060/1061), etc.
        const ignorable = [1050, 1060, 1061, 1826, 1062];
        if (!ignorable.includes(e.errno)) {
          console.warn('[DB] DDL warning:', e.message);
        }
      }
    }
    console.log('[DB] MySQL schema verified.');

      // Check if hostels need seeding
      const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM hostels');
      if (rows[0].cnt === 0) {
        console.log('[DB] Seeding MySQL campus tables...');
        // Seed wardens
        for (const w of INITIAL_WARDENS) {
          await pool.query(
            'INSERT INTO wardens (id, name, email, phone, role, office_room, qualification) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [w.id, w.name, w.email, w.phone, w.role, w.office_room, w.qualification]
          );
        }
        // Seed hostels
        for (const h of INITIAL_HOSTELS) {
          await pool.query(
            'INSERT INTO hostels (id, name, code, type, total_floors, total_rooms, total_capacity, warden_id, location_block, contact_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [h.id, h.name, h.code, h.type, h.total_floors, h.total_rooms, h.total_capacity, h.warden_id, h.location_block, h.contact_number]
          );
        }
        // Seed rooms & beds
        const generated = generateRoomsAndBeds();
        for (const r of generated.rooms) {
          await pool.query(
            'INSERT INTO rooms (id, hostel_id, room_number, floor_number, room_type, climate_type, capacity, occupied_beds, status, fee_per_semester) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [r.id, r.hostel_id, r.room_number, r.floor_number, r.room_type, r.climate_type, r.capacity, r.occupied_beds, r.status, r.fee_per_semester]
          );
        }
        for (const b of generated.beds) {
          await pool.query(
            'INSERT INTO beds (id, room_id, hostel_id, bed_letter, status, student_id) VALUES (?, ?, ?, ?, ?, ?)',
            [b.id, b.room_id, b.hostel_id, b.bed_letter, b.status, b.student_id]
          );
        }
        // Seed students
        for (const s of INITIAL_STUDENTS) {
          await pool.query(
            'INSERT INTO students (id, roll_number, name, email, phone, gender, department, year_of_study, guardian_name, guardian_phone, blood_group, address, hostel_id, room_id, bed_id, admission_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [s.id, s.roll_number, s.name, s.email, s.phone, s.gender, s.department, s.year_of_study, s.guardian_name, s.guardian_phone, s.blood_group, s.address, s.hostel_id, s.room_id, s.bed_id, s.admission_date, s.status]
          );
          if (s.bed_id) {
            await pool.query('UPDATE beds SET status = "occupied", student_id = ? WHERE id = ?', [s.id, s.bed_id]);
            await pool.query('UPDATE rooms SET occupied_beds = occupied_beds + 1 WHERE id = ?', [s.room_id]);
          }
        }
        // Seed fees
        for (const f of INITIAL_FEES) {
          await pool.query(
            'INSERT INTO fee_records (id, student_id, semester, fee_type, total_amount, paid_amount, due_amount, due_date, status, payment_method, transaction_ref) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [f.id, f.student_id, f.semester, f.fee_type, f.total_amount, f.paid_amount, f.due_amount, f.due_date, f.status, f.payment_method, f.transaction_ref]
          );
        }
        // Seed complaints
        for (const c of INITIAL_COMPLAINTS) {
          await pool.query(
            'INSERT INTO complaints (id, student_id, hostel_id, room_id, category, title, description, priority, status, assigned_to, resolution_notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [c.id, c.student_id, c.hostel_id, c.room_id, c.category, c.title, c.description, c.priority, c.status, c.assigned_to, c.resolution_notes, c.created_at]
          );
        }
        // Seed gate passes
        for (const g of INITIAL_GATE_PASSES) {
          await pool.query(
            'INSERT INTO gate_passes (id, student_id, hostel_id, destination, reason, out_time, expected_in_time, actual_in_time, status, approved_by_warden_id, guard_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [g.id, g.student_id, g.hostel_id, g.destination, g.reason, g.out_time, g.expected_in_time, g.actual_in_time, g.status, g.approved_by_warden_id, g.guard_notes]
          );
        }
        // Seed mess menu
        for (const m of INITIAL_MESS_MENU) {
          await pool.query(
            'INSERT INTO mess_menu (id, day_of_week, meal_type, items, timing) VALUES (?, ?, ?, ?, ?)',
            [m.id, m.day_of_week, m.meal_type, m.items, m.timing]
          );
        }
        console.log('[DB] MySQL initial campus dataset seeded successfully.');
      }
  } catch (err) {
    console.error('[DB] Schema setup error:', err.message);
  }
}

function getStatus() {
  return {
    isConnected: isConnectedToMySQL,
    engine: isConnectedToMySQL ? 'MySQL (Live Connection)' : 'Campus Memory & File Engine (MySQL Ready)',
    config: {
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      database: dbConfig.database,
      hasPassword: Boolean(dbConfig.password && dbConfig.password.length > 0)
    },
    error: dbErrorReason,
    campusSummary: {
      hostelsCount: 5,
      boysHostels: 4,
      girlsHostels: 1,
      roomsPerHostel: 80,
      totalRooms: 400,
      totalBeds: 1000,
      wardensCount: 6
    }
  };
}

let initPromise = null;
function ensureDbInit() {
  if (isConnectedToMySQL) return Promise.resolve();
  if (!initPromise) {
    initPromise = initMySQL().catch(err => {
      console.warn('[DB] Auto-init notice:', err.message);
    });
  }
  return initPromise;
}

module.exports = {
  initMySQL,
  ensureDbInit,
  getStatus,
  get pool() {
    return pool;
  },
  get isConnected() {
    return isConnectedToMySQL;
  },
  memoryStore
};
