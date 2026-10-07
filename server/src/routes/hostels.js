const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/hostels - List all hostels with live stats
router.get('/', async (req, res) => {
  try {
    if (db.isConnected && db.pool) {
      const [hostels] = await db.pool.query(`
        SELECT h.*, w.name as warden_name, w.phone as warden_phone, w.email as warden_email,
               COUNT(DISTINCT r.id) as actual_rooms_count,
               COALESCE(SUM(r.occupied_beds), 0) as current_occupied
        FROM hostels h
        LEFT JOIN wardens w ON h.warden_id = w.id
        LEFT JOIN rooms r ON h.id = r.hostel_id
        GROUP BY h.id
      `);
      return res.json({ success: true, data: hostels });
    }

    // Memory Store
    const hostels = db.memoryStore.hostels.map(h => {
      const warden = db.memoryStore.wardens.find(w => w.id === h.warden_id);
      const rooms = db.memoryStore.rooms.filter(r => r.hostel_id === h.id);
      const occupied = rooms.reduce((acc, r) => acc + (r.occupied_beds || 0), 0);
      return {
        ...h,
        warden_name: warden ? warden.name : 'Unassigned',
        warden_phone: warden ? warden.phone : '',
        warden_email: warden ? warden.email : '',
        actual_rooms_count: rooms.length,
        current_occupied: occupied
      };
    });

    res.json({ success: true, data: hostels });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/hostels/:id - Details of a single hostel
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (db.isConnected && db.pool) {
      const [rows] = await db.pool.query(`
        SELECT h.*, w.name as warden_name, w.phone as warden_phone, w.email as warden_email
        FROM hostels h
        LEFT JOIN wardens w ON h.warden_id = w.id
        WHERE h.id = ?
      `, [id]);
      if (!rows.length) return res.status(404).json({ success: false, error: 'Hostel not found' });
      return res.json({ success: true, data: rows[0] });
    }

    const hostel = db.memoryStore.hostels.find(h => h.id === id);
    if (!hostel) return res.status(404).json({ success: false, error: 'Hostel not found' });
    const warden = db.memoryStore.wardens.find(w => w.id === hostel.warden_id);

    res.json({
      success: true,
      data: {
        ...hostel,
        warden_name: warden ? warden.name : null,
        warden_phone: warden ? warden.phone : null,
        warden_email: warden ? warden.email : null
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
