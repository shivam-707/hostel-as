require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initMySQL } = require('./config/db');

const hostelsRouter = require('./routes/hostels');
const roomsRouter = require('./routes/rooms');
const studentsRouter = require('./routes/students');
const allocationsRouter = require('./routes/allocations');
const feesRouter = require('./routes/fees');
const complaintsRouter = require('./routes/complaints');
const gatepassesRouter = require('./routes/gatepasses');
const wardensRouter = require('./routes/wardens');
const messRouter = require('./routes/mess');
const statsRouter = require('./routes/stats');
const dbRouter = require('./routes/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/hostels', hostelsRouter);
app.use('/api/rooms', roomsRouter);
app.use('/api/students', studentsRouter);
app.use('/api/allocations', allocationsRouter);
app.use('/api/fees', feesRouter);
app.use('/api/complaints', complaintsRouter);
app.use('/api/gatepasses', gatepassesRouter);
app.use('/api/wardens', wardensRouter);
app.use('/api/mess', messRouter);
app.use('/api/stats', statsRouter);
app.use('/api/db', dbRouter);

// Root healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Hostel Administration System API',
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  // Try connecting to MySQL
  await initMySQL();

  app.listen(PORT, () => {
    console.log(`[SERVER] Hostel Administration Backend listening on port ${PORT}`);
    console.log(`[SERVER] Health check: http://localhost:${PORT}/api/health`);
  });
}

startServer();
