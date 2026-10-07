const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/gatepasses - List gate passes
router.get('/', async (req, res) => {
  try {
    const { status, hostel_id } = req.query;

    if (db.isConnected && db.pool) {
      let query = `
        SELECT g.*, s.name as student_name, s.roll_number as student_roll,
               s.phone as student_phone, h.name as hostel_name,
               w.name as approver_warden_name
        FROM gate_passes g
        JOIN students s ON g.student_id = s.id
        JOIN hostels h ON g.hostel_id = h.id
        LEFT JOIN wardens w ON g.approved_by_warden_id = w.id
        WHERE 1=1
      `;
      const params = [];
      if (status) {
        query += ' AND g.status = ?';
        params.push(status);
      }
      if (hostel_id) {
        query += ' AND g.hostel_id = ?';
        params.push(parseInt(hostel_id, 10));
      }
      query += ' ORDER BY g.id DESC';
      const [rows] = await db.pool.query(query, params);
      return res.json({ success: true, count: rows.length, data: rows });
    }

    // Memory Store
    let list = [...db.memoryStore.gatePasses];
    if (status) list = list.filter(g => g.status === status);
    if (hostel_id) list = list.filter(g => g.hostel_id === parseInt(hostel_id, 10));

    const data = list.map(g => {
      const s = db.memoryStore.students.find(x => x.id === g.student_id);
      const h = db.memoryStore.hostels.find(x => x.id === g.hostel_id);
      const w = db.memoryStore.wardens.find(x => x.id === g.approved_by_warden_id);
      return {
        ...g,
        student_name: s ? s.name : 'Unknown',
        student_roll: s ? s.roll_number : 'N/A',
        student_phone: s ? s.phone : 'N/A',
        hostel_name: h ? h.name : 'N/A',
        approver_warden_name: w ? w.name : 'Pending'
      };
    });

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/gatepasses - Request new pass
router.post('/', async (req, res) => {
  try {
    const { student_id, destination, reason, out_time, expected_in_time } = req.body;
    if (!student_id || !destination || !reason || !out_time || !expected_in_time) {
      return res.status(400).json({ success: false, error: 'Missing required gate pass fields' });
    }

    if (db.isConnected && db.pool) {
      const [students] = await db.pool.query('SELECT hostel_id FROM students WHERE id = ?', [student_id]);
      const hostelId = students.length ? students[0].hostel_id : 1;

      const [resIns] = await db.pool.query(
        `INSERT INTO gate_passes (student_id, hostel_id, destination, reason, out_time, expected_in_time, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [student_id, hostelId, destination, reason, out_time, expected_in_time]
      );
      return res.status(201).json({ success: true, id: resIns.insertId, message: 'Gate pass requested' });
    }

    const student = db.memoryStore.students.find(s => s.id === parseInt(student_id, 10));
    const hostelId = student && student.hostel_id ? student.hostel_id : 1;

    const newPass = {
      id: db.memoryStore.gatePasses.length + 1,
      student_id: parseInt(student_id, 10),
      hostel_id: hostelId,
      destination,
      reason,
      out_time,
      expected_in_time,
      actual_in_time: null,
      status: 'pending',
      approved_by_warden_id: null,
      guard_notes: null,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    db.memoryStore.gatePasses.unshift(newPass);
    db.memoryStore.saveToDisk();

    res.status(201).json({ success: true, id: newPass.id, message: 'Gate pass requested' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/gatepasses/:id/status - Approve / Checkout / Return
router.put('/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, approved_by_warden_id, guard_notes } = req.body;

    if (db.isConnected && db.pool) {
      const actualIn = status === 'returned' ? new Date() : null;
      await db.pool.query(
        `UPDATE gate_passes
         SET status = ?,
             approved_by_warden_id = COALESCE(?, approved_by_warden_id),
             guard_notes = COALESCE(?, guard_notes),
             actual_in_time = CASE WHEN ? = 'returned' THEN CURRENT_TIMESTAMP ELSE actual_in_time END
         WHERE id = ?`,
        [status, approved_by_warden_id, guard_notes, status, id]
      );
      return res.json({ success: true, message: 'Gate pass status updated' });
    }

    const pass = db.memoryStore.gatePasses.find(g => g.id === id);
    if (!pass) return res.status(404).json({ success: false, error: 'Gate pass not found' });

    pass.status = status;
    if (approved_by_warden_id) pass.approved_by_warden_id = parseInt(approved_by_warden_id, 10);
    if (guard_notes) pass.guard_notes = guard_notes;
    if (status === 'returned') {
      pass.actual_in_time = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }

    db.memoryStore.saveToDisk();
    res.json({ success: true, message: 'Gate pass status updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
