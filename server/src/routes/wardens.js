const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/wardens - List all wardens
router.get('/', async (req, res) => {
  try {
    if (db.isConnected && db.pool) {
      const [rows] = await db.pool.query(`
        SELECT w.*, h.name as assigned_hostel_name, h.code as assigned_hostel_code
        FROM wardens w
        LEFT JOIN hostels h ON h.warden_id = w.id
        ORDER BY w.role = 'chief_warden' DESC, w.id ASC
      `);
      return res.json({ success: true, count: rows.length, data: rows });
    }

    const data = db.memoryStore.wardens.map(w => {
      const hostel = db.memoryStore.hostels.find(h => h.warden_id === w.id);
      return {
        ...w,
        assigned_hostel_name: hostel ? hostel.name : (w.role === 'chief_warden' ? 'All Campus Hostels' : 'Unassigned'),
        assigned_hostel_code: hostel ? hostel.code : 'CAMPUS'
      };
    });

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
