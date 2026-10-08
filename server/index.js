const app = require('./src/app');
const { initMySQL } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Listen on 0.0.0.0 for container / cloud hosting compatibility
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] Hostel Administration Backend listening on port ${PORT}`);
  console.log(`[SERVER] Health check: http://0.0.0.0:${PORT}/api/health`);
});

// Non-blocking database initialization
initMySQL().catch(err => {
  console.warn('[SERVER] DB notice:', err.message);
});

module.exports = app;
