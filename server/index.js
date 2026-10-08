const app = require('./src/app');
const { initMySQL } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  initMySQL().then(() => {
    app.listen(PORT, () => {
      console.log(`[SERVER] Hostel Administration Backend listening on port ${PORT}`);
      console.log(`[SERVER] Health check: http://localhost:${PORT}/api/health`);
    });
  }).catch((err) => {
    console.warn('[SERVER] DB notice:', err.message);
    app.listen(PORT, () => {
      console.log(`[SERVER] Hostel Administration Backend listening on port ${PORT}`);
    });
  });
}

module.exports = app;
