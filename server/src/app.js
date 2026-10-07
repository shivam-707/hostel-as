require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

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

app.use(cors());
app.use(express.json());

// Auto-initialize DB on request if not already initialized
app.use(async (req, res, next) => {
  if (db.ensureDbInit) {
    try {
      await db.ensureDbInit();
    } catch (_) {}
  }
  next();
});

// Create an API router containing all subroutes
const apiRouter = express.Router();
apiRouter.use('/hostels', hostelsRouter);
apiRouter.use('/rooms', roomsRouter);
apiRouter.use('/students', studentsRouter);
apiRouter.use('/allocations', allocationsRouter);
apiRouter.use('/fees', feesRouter);
apiRouter.use('/complaints', complaintsRouter);
apiRouter.use('/gatepasses', gatepassesRouter);
apiRouter.use('/wardens', wardensRouter);
apiRouter.use('/mess', messRouter);
apiRouter.use('/stats', statsRouter);
apiRouter.use('/db', dbRouter);

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Hostel Administration System API',
    engine: db.isConnected ? 'MySQL' : 'Persistent Campus Engine',
    timestamp: new Date().toISOString()
  });
});

// Mount on both /api (standard) and / (in case serverless rewrites strip the prefix)
app.use('/api', apiRouter);
app.use('/', apiRouter);

module.exports = app;
