const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/db/status - Current DB status
router.get('/status', (req, res) => {
  res.json({ success: true, data: db.getStatus() });
});

// POST /api/db/test-connect - Test/apply MySQL credentials
router.post('/test-connect', async (req, res) => {
  const { host, port, user, password, database } = req.body;
  const result = await db.initMySQL({
    host: host || '127.0.0.1',
    port: parseInt(port || '3306', 10),
    user: user || 'root',
    password: password || '',
    database: database || 'hostel_db'
  });

  res.json({
    success: result.success,
    message: result.message,
    status: db.getStatus()
  });
});

module.exports = router;
