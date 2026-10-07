
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/complaints - List tickets
router.get('/', async (req, res) => {
  try {
    const { status, category, priority, hostel_id } = req.query;

    if (db.isConnected && db.pool) {
      let query = `
        SELECT c.*, s.name as student_name, s.roll_number as student_roll,
               h.name as hostel_name, r.room_number
        FROM complaints c
        JOIN students s ON c.student_id = s.id
        JOIN hostels h ON c.hostel_id = h.id
        LEFT JOIN rooms r ON c.room_id = r.id
        WHERE 1=1
      `;
      const params = [];
      if (status) {
        query += ' AND c.status = ?';
        params.push(status);
      }
      if (category) {
        query += ' AND c.category = ?';
        params.push(category);
      }
      if (priority) {
        query += ' AND c.priority = ?';
        params.push(priority);
      }
      if (hostel_id) {
        query += ' AND c.hostel_id = ?';
        params.push(parseInt(hostel_id, 10));
      }
      query += ' ORDER BY c.id DESC';
      const [rows] = await db.pool.query(query, params);
      return res.json({ success: true, count: rows.length, data: rows });
    }

    // Memory Store
    let list = [...db.memoryStore.complaints];
    if (status) list = list.filter(c => c.status === status);
    if (category) list = list.filter(c => c.category === category);
    if (priority) list = list.filter(c => c.priority === priority);
    if (hostel_id) list = list.filter(c => c.hostel_id === parseInt(hostel_id, 10));

    const data = list.map(c => {
      const s = db.memoryStore.students.find(x => x.id === c.student_id);
      const h = db.memoryStore.hostels.find(x => x.id === c.hostel_id);
      const r = db.memoryStore.rooms.find(x => x.id === c.room_id);
      return {
        ...c,
        student_name: s ? s.name : 'Unknown',
        student_roll: s ? s.roll_number : 'N/A',
        hostel_name: h ? h.name : 'N/A',
        room_number: r ? r.room_number : 'N/A'
      };
    });

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/complaints - Create grievance ticket
router.post('/', async (req, res) => {
  try {
    const { student_id, hostel_id, room_id, category, title, description, priority } = req.body;
    if (!student_id || !hostel_id || !category || !title || !description) {
      return res.status(400).json({ success: false, error: 'Missing required complaint parameters' });
    }

    if (db.isConnected && db.pool) {
      const [result] = await db.pool.query(
        `INSERT INTO complaints (student_id, hostel_id, room_id, category, title, description, priority, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'open')`,
        [student_id, hostel_id, room_id || null, category, title, description, priority || 'medium']
      );
      return res.status(201).json({ success: true, id: result.insertId, message: 'Complaint registered' });
    }

    const newTicket = {
      id: db.memoryStore.complaints.length + 1,
      student_id: parseInt(student_id, 10),
      hostel_id: parseInt(hostel_id, 10),
      room_id: room_id ? parseInt(room_id, 10) : null,
      category,
      title,
      description,
      priority: priority || 'medium',
      status: 'open',
      assigned_to: null,
      resolution_notes: null,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      resolved_at: null
    };

    db.memoryStore.complaints.unshift(newTicket);
    db.memoryStore.saveToDisk();

    res.status(201).json({ success: true, id: newTicket.id, message: 'Complaint registered' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/complaints/:id - Update ticket status / assign
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, assigned_to, resolution_notes } = req.body;

    if (db.isConnected && db.pool) {
      const resolvedAt = status === 'resolved' ? new Date() : null;
      await db.pool.query(
        `UPDATE complaints
         SET status = COALESCE(?, status),
             assigned_to = COALESCE(?, assigned_to),
             resolution_notes = COALESCE(?, resolution_notes),
             resolved_at = CASE WHEN ? = 'resolved' THEN CURRENT_TIMESTAMP ELSE resolved_at END
         WHERE id = ?`,
        [status, assigned_to, resolution_notes, status, id]
      );
      return res.json({ success: true, message: 'Complaint updated' });
    }

    const ticket = db.memoryStore.complaints.find(c => c.id === id);
    if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found' });

    if (status) ticket.status = status;
    if (assigned_to !== undefined) ticket.assigned_to = assigned_to;
    if (resolution_notes !== undefined) ticket.resolution_notes = resolution_notes;
    if (status === 'resolved') {
      ticket.resolved_at = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }

    db.memoryStore.saveToDisk();
    res.json({ success: true, message: 'Complaint updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
