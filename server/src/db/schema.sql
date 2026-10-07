-- ========================================================
-- Hostel Administration System - Production MySQL Schema
-- Campus Architecture: 4 Boys Hostels + 1 Girls Hostel
-- Capacity: 400 Rooms (80 per hostel), 1,000 Bed Capacity
-- ========================================================

CREATE DATABASE IF NOT EXISTS hostel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hostel_db;

-- 1. Wardens Directory
CREATE TABLE IF NOT EXISTS wardens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role ENUM('chief_warden', 'hostel_warden', 'assistant_warden') NOT NULL DEFAULT 'hostel_warden',
  office_room VARCHAR(50),
  qualification VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Hostels Master Table (4 Boys + 1 Girls)
CREATE TABLE IF NOT EXISTS hostels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  type ENUM('boys', 'girls') NOT NULL,
  total_floors INT NOT NULL DEFAULT 4,
  total_rooms INT NOT NULL DEFAULT 80,
  total_capacity INT NOT NULL DEFAULT 200,
  warden_id INT NULL,
  location_block VARCHAR(100),
  contact_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (warden_id) REFERENCES wardens(id) ON DELETE SET NULL
);

-- 3. Rooms Table (80 rooms per hostel: 20x 2-seater AC, 20x 2-seater Non-AC, 20x 3-seater AC, 20x 3-seater Non-AC)
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hostel_id INT NOT NULL,
  room_number VARCHAR(10) NOT NULL,
  floor_number INT NOT NULL,
  room_type ENUM('2_seater', '3_seater') NOT NULL,
  climate_type ENUM('ac', 'non_ac') NOT NULL,
  capacity INT NOT NULL,
  occupied_beds INT NOT NULL DEFAULT 0,
  status ENUM('available', 'full', 'maintenance') DEFAULT 'available',
  fee_per_semester DECIMAL(10,2) NOT NULL DEFAULT 35000.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_hostel_room (hostel_id, room_number),
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
);

-- 4. Beds Table
CREATE TABLE IF NOT EXISTS beds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  hostel_id INT NOT NULL,
  bed_letter CHAR(1) NOT NULL, -- 'A', 'B', 'C'
  status ENUM('vacant', 'occupied', 'reserved') DEFAULT 'vacant',
  student_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_room_bed (room_id, bed_letter),
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
);

-- 5. Students Directory
CREATE TABLE IF NOT EXISTS students (
  id INT AUTO_INCREMENT PRIMARY KEY,
  roll_number VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  gender ENUM('male', 'female') NOT NULL,
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
  status ENUM('active', 'graduated', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE SET NULL,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
  FOREIGN KEY (bed_id) REFERENCES beds(id) ON DELETE SET NULL
);

-- Add foreign key back to beds for student_id
ALTER TABLE beds ADD CONSTRAINT fk_bed_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL;

-- 6. Room Allocation History
CREATE TABLE IF NOT EXISTS allocations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  hostel_id INT NOT NULL,
  room_id INT NOT NULL,
  bed_id INT NOT NULL,
  allocated_date DATE NOT NULL,
  vacated_date DATE NULL,
  status ENUM('active', 'transferred', 'vacated') DEFAULT 'active',
  remarks VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (bed_id) REFERENCES beds(id) ON DELETE CASCADE
);

-- 7. Fee Tracking Ledger
CREATE TABLE IF NOT EXISTS fee_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  semester VARCHAR(30) NOT NULL, -- e.g. "Fall 2026", "Spring 2027"
  fee_type VARCHAR(50) DEFAULT 'Hostel & Mess Fee',
  total_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  due_amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status ENUM('paid', 'partial', 'pending') DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_ref VARCHAR(100),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 8. Grievance & Maintenance Tickets
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  hostel_id INT NOT NULL,
  room_id INT NOT NULL,
  category ENUM('electrical', 'plumbing', 'carpentry', 'wifi', 'cleaning', 'other') NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high', 'emergency') DEFAULT 'medium',
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  assigned_to VARCHAR(100),
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 9. Digital Gate Pass & Leave Tracker
CREATE TABLE IF NOT EXISTS gate_passes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  hostel_id INT NOT NULL,
  destination VARCHAR(150) NOT NULL,
  reason TEXT NOT NULL,
  out_time DATETIME NOT NULL,
  expected_in_time DATETIME NOT NULL,
  actual_in_time DATETIME NULL,
  status ENUM('pending', 'approved', 'rejected', 'checked_out', 'returned') DEFAULT 'pending',
  approved_by_warden_id INT NULL,
  guard_notes VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by_warden_id) REFERENCES wardens(id) ON DELETE SET NULL
);

-- 10. Mess Daily Menu
CREATE TABLE IF NOT EXISTS mess_menu (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hostel_type ENUM('all', 'boys', 'girls') DEFAULT 'all',
  day_of_week ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
  meal_type ENUM('breakfast', 'lunch', 'snacks', 'dinner') NOT NULL,
  items TEXT NOT NULL,
  timing VARCHAR(50) NOT NULL,
  is_special BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. System Users & Roles
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'chief_warden', 'warden', 'student') NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  ref_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
