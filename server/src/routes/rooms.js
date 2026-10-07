const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/rooms - Query rooms with filters
router.get('/', async (req, res) => {
  try {
    const { hostel_id, floor, room_type, climate_type, status, page = 1, limit = 100 } = req.query;

    if (db.isConnected && db.pool) {
      let query = `
        SELECT r.*, h.name as hostel_name, h.code as hostel_code
        FROM rooms r
        JOIN hostels h ON r.hostel_id = h.id
        WHERE 1=1
      `;
      const params = [];

      if (hostel_id) {
        query += ' AND r.hostel_id = ?';
        params.push(parseInt(hostel_id, 10));
      }
      if (floor !== undefined && floor !== '') {
        query += ' AND r.floor_number = ?';
        params.push(parseInt(floor, 10));
      }
      if (room_type) {
        query += ' AND r.room_type = ?';
        params.push(room_type);
      }
      if (climate_type) {
        query += ' AND r.climate_type = ?';
        params.push(climate_type);
      }
      if (status) {
        query += ' AND r.status = ?';
        params.push(status);
      }

      query += ' ORDER BY r.hostel_id ASC, r.floor_number ASC, r.room_number ASC';
      const [rooms] = await db.pool.query(query, params);
      return res.json({ success: true, count: rooms.length, data: rooms });
    }

    // Memory Store
    let filtered = [...db.memoryStore.rooms];
    if (hostel_id) {
      const hid = parseInt(hostel_id, 10);
      filtered = filtered.filter(r => r.hostel_id === hid);
    }
    if (floor !== undefined && floor !== '') {
      const f = parseInt(floor, 10);
      filtered = filtered.filter(r => r.floor_number === f);
    }
    if (room_type) {
      filtered = filtered.filter(r => r.room_type === room_type);
    }
    if (climate_type) {
      filtered = filtered.filter(r => r.climate_type === climate_type);
    }
    if (status) {
      filtered = filtered.filter(r => r.status === status);
    }

    const data = filtered.map(r => {
      const h = db.memoryStore.hostels.find(x => x.id === r.hostel_id);
      return {
        ...r,
        hostel_name: h ? h.name : '',
        hostel_code: h ? h.code : ''
      };
    });

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/rooms/:id - Single room with its beds and occupants
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (db.isConnected && db.pool) {
      const [rooms] = await db.pool.query(`
        SELECT r.*, h.name as hostel_name, h.code as hostel_code
        FROM rooms r
        JOIN hostels h ON r.hostel_id = h.id
        WHERE r.id = ?
      `, [id]);
      if (!rooms.length) return res.status(404).json({ success: false, error: 'Room not found' });
      
      const [beds] = await db.pool.query(`
        SELECT b.*, s.name as student_name, s.roll_number as student_roll, s.phone as student_phone, s.department as student_dept
        FROM beds b
        LEFT JOIN students s ON b.student_id = s.id
        WHERE b.room_id = ?
        ORDER BY b.bed_letter ASC
      `, [id]);

      return res.json({ success: true, data: { ...rooms[0], beds } });
    }

    const room = db.memoryStore.rooms.find(r => r.id === id);
    if (!room) return res.status(404).json({ success: false, error: 'Room not found' });
    const hostel = db.memoryStore.hostels.find(h => h.id === room.hostel_id);

    const beds = db.memoryStore.beds
      .filter(b => b.room_id === id)
      .map(b => {
        const student = db.memoryStore.students.find(s => s.id === b.student_id);
        return {
          ...b,
          student_name: student ? student.name : null,
          student_roll: student ? student.roll_number : null,
          student_phone: student ? student.phone : null,
          student_dept: student ? student.department : null
        };
      });

    res.json({
      success: true,
      data: {
        ...room,
        hostel_name: hostel ? hostel.name : '',
        hostel_code: hostel ? hostel.code : '',
        beds
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
