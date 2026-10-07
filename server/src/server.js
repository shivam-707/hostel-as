require('dotenv').config();
const app = require('./app');
const { initMySQL } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Try connecting to MySQL
  await initMySQL();

  app.listen(PORT, () => {
    console.log(`[SERVER] Hostel Administration Backend listening on port ${PORT}`);
    console.log(`[SERVER] Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer();
