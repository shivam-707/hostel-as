const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/mess/menu - Get weekly menu
router.get('/menu', async (req, res) => {
  try {
    const { day } = req.query;

    if (db.isConnected && db.pool) {
      let query = 'SELECT * FROM mess_menu';
      const params = [];
      if (day) {
        query += ' WHERE day_of_week = ?';
        params.push(day.toLowerCase());
      }
      query += ' ORDER BY FIELD(day_of_week, "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"), FIELD(meal_type, "breakfast", "lunch", "snacks", "dinner")';
      const [rows] = await db.pool.query(query, params);
      return res.json({ success: true, data: rows });
    }

    let menu = [...db.memoryStore.messMenu];
    if (day) {
      menu = menu.filter(m => m.day_of_week === day.toLowerCase());
    }

    res.json({ success: true, data: menu });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
