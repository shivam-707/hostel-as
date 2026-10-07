const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/students - List students
router.get('/', async (req, res) => {
  try {
    const { hostel_id, search, department, year } = req.query;

    if (db.isConnected && db.pool) {
      let query = `
        SELECT s.*, h.name as hostel_name, h.code as hostel_code,
               r.room_number, b.bed_letter
        FROM students s
        LEFT JOIN hostels h ON s.hostel_id = h.id
        LEFT JOIN rooms r ON s.room_id = r.id
        LEFT JOIN beds b ON s.bed_id = b.id
        WHERE 1=1
      `;
      const params = [];
      if (hostel_id) {
        query += ' AND s.hostel_id = ?';
        params.push(parseInt(hostel_id, 10));
      }
      if (search) {
        query += ' AND (s.name LIKE ? OR s.roll_number LIKE ? OR s.email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      if (department) {
        query += ' AND s.department = ?';
        params.push(department);
      }
      if (year) {
        query += ' AND s.year_of_study = ?';
        params.push(parseInt(year, 10));
      }
      query += ' ORDER BY s.id DESC';
      const [students] = await db.pool.query(query, params);
      return res.json({ success: true, count: students.length, data: students });
    }

    // Memory Store
    let list = [...db.memoryStore.students];
    if (hostel_id) {
      const hid = parseInt(hostel_id, 10);
      list = list.filter(s => s.hostel_id === hid);
    }
    if (search) {
      const term = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.roll_number.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term)
      );
    }
    if (department) {
      list = list.filter(s => s.department === department);
    }
    if (year) {
      list = list.filter(s => s.year_of_study === parseInt(year, 10));
    }

    const data = list.map(s => {
      const h = db.memoryStore.hostels.find(x => x.id === s.hostel_id);
      const r = db.memoryStore.rooms.find(x => x.id === s.room_id);
      const b = db.memoryStore.beds.find(x => x.id === s.bed_id);
      return {
        ...s,
        hostel_name: h ? h.name : null,
        hostel_code: h ? h.code : null,
        room_number: r ? r.room_number : null,
        bed_letter: b ? b.bed_letter : null
      };
    });

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/students - Admit new student
router.post('/', async (req, res) => {
  try {
    const { roll_number, name, email, phone, gender, department, year_of_study, guardian_name, guardian_phone, blood_group, address } = req.body;

    if (!roll_number || !name || !email || !phone || !gender) {
      return res.status(400).json({ success: false, error: 'Missing required student fields' });
    }

    if (db.isConnected && db.pool) {
      const [result] = await db.pool.query(
        `INSERT INTO students (roll_number, name, email, phone, gender, department, year_of_study, guardian_name, guardian_phone, blood_group, address, admission_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
        [roll_number, name, email, phone, gender, department || 'General', year_of_study || 1, guardian_name || 'N/A', guardian_phone || 'N/A', blood_group || 'O+', address || '']
      );
      return res.status(201).json({ success: true, id: result.insertId, message: 'Student registered successfully' });
    }

    const newStudent = {
      id: db.memoryStore.students.length + 1,
      roll_number,
      name,
      email,
      phone,
      gender,
      department: department || 'General',
      year_of_study: parseInt(year_of_study || 1, 10),
      guardian_name: guardian_name || 'N/A',
      guardian_phone: guardian_phone || 'N/A',
      blood_group: blood_group || 'O+',
      address: address || '',
      hostel_id: null,
      room_id: null,
      bed_id: null,
      admission_date: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    db.memoryStore.students.unshift(newStudent);
    db.memoryStore.saveToDisk();

    res.status(201).json({ success: true, id: newStudent.id, message: 'Student registered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
