const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/stats/campus-architecture - Exact campus configuration requested by user
router.get('/campus-architecture', async (req, res) => {
  const architecture = {
    campusOverview: {
      totalHostels: 5,
      boysHostelsCount: 4,
      girlsHostelsCount: 1,
      roomsPerHostel: 80,
      totalRooms: 400,
      totalBedCapacity: 1000,
      chiefWardensCount: 1,
      hostelWardensCount: 5,
      totalWardensCount: 6
    },
    roomDistributionPerHostel: {
      roomsPerHostel: 80,
      floorsPerHostel: 4,
      roomsPerFloor: 20,
      breakdown: [
        { type: '2-Seater AC', roomsCount: 20, bedCapacity: 40, floors: 'Ground & 1st Floor (10 per floor)' },
        { type: '2-Seater Non-AC', roomsCount: 20, bedCapacity: 40, floors: 'Ground & 1st Floor (10 per floor)' },
        { type: '3-Seater AC', roomsCount: 20, bedCapacity: 60, floors: '2nd & 3rd Floor (10 per floor)' },
        { type: '3-Seater Non-AC', roomsCount: 20, bedCapacity: 60, floors: '2nd & 3rd Floor (10 per floor)' }
      ],
      totalHostelCapacity: 200
    },
    campusTotals: {
      twoSeaterAC: { rooms: 100, beds: 200 },
      twoSeaterNonAC: { rooms: 100, beds: 200 },
      threeSeaterAC: { rooms: 100, beds: 300 },
      threeSeaterNonAC: { rooms: 100, beds: 300 },
      grandTotalRooms: 400,
      grandTotalBeds: 1000,
      boysHostelCapacity: 800,
      girlsHostelCapacity: 200
    },
    hostelsDirectory: [
      { id: 1, name: 'Sukhmani Boys Hostel', code: 'BH-1', type: 'boys', rooms: 80, capacity: 200, warden: 'Prof. Vikram Malhotra' },
      { id: 2, name: 'Sukhsagar Boys Hostel', code: 'BH-2', type: 'boys', rooms: 80, capacity: 200, warden: 'Dr. Amit Verma' },
      { id: 3, name: 'Sadbhawna Boys Hostel', code: 'BH-3', type: 'boys', rooms: 80, capacity: 200, warden: 'Prof. Suresh Kulkarni' },
      { id: 4, name: 'Shantikunj Boys Hostel', code: 'BH-4', type: 'boys', rooms: 80, capacity: 200, warden: 'Dr. Manoj Nair' },
      { id: 5, name: 'Kalpana Girls Hostel', code: 'GH-1', type: 'girls', rooms: 80, capacity: 200, warden: 'Dr. Sunita Deshmukh' }
    ]
  };

  res.json({ success: true, data: architecture });
});

// GET /api/stats/dashboard - Real-time metrics
router.get('/dashboard', async (req, res) => {
  try {
    if (db.isConnected && db.pool) {
      const [[hostelStats]] = await db.pool.query('SELECT COUNT(*) as total_hostels FROM hostels');
      const [[roomStats]] = await db.pool.query('SELECT COUNT(*) as total_rooms, SUM(capacity) as total_capacity, SUM(occupied_beds) as occupied_beds FROM rooms');
      const [[studentStats]] = await db.pool.query('SELECT COUNT(*) as total_students FROM students WHERE status = "active"');
      const [[wardenStats]] = await db.pool.query('SELECT COUNT(*) as total_wardens FROM wardens');
      const [[complaintStats]] = await db.pool.query('SELECT COUNT(*) as pending_complaints FROM complaints WHERE status IN ("open", "in_progress")');
      const [[passStats]] = await db.pool.query('SELECT COUNT(*) as active_passes FROM gate_passes WHERE status IN ("approved", "checked_out")');
      const [[feeStats]] = await db.pool.query('SELECT COALESCE(SUM(paid_amount), 0) as total_collected, COALESCE(SUM(due_amount), 0) as total_due FROM fee_records');

      // Breakdown per hostel
      const [hostelBreakdown] = await db.pool.query(`
        SELECT h.id, h.name, h.code, h.type, h.total_capacity,
               COUNT(r.id) as room_count,
               COALESCE(SUM(r.occupied_beds), 0) as occupied_beds
        FROM hostels h
        LEFT JOIN rooms r ON h.id = r.hostel_id
        GROUP BY h.id
      `);

      const totalBeds = Number(roomStats.total_capacity) || 1000;
      const occupiedBeds = Number(roomStats.occupied_beds) || 0;

      return res.json({
        success: true,
        data: {
          totalHostels: hostelStats.total_hostels,
          totalRooms: roomStats.total_rooms,
          totalBeds,
          occupiedBeds,
          availableBeds: totalBeds - occupiedBeds,
          occupancyRate: totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
          totalStudents: studentStats.total_students,
          totalWardens: wardenStats.total_wardens,
          pendingComplaints: complaintStats.pending_complaints,
          activeGatePasses: passStats.active_passes,
          totalFeeCollected: Number(feeStats.total_collected),
          totalFeeDue: Number(feeStats.total_due),
          hostelBreakdown: hostelBreakdown.map(h => ({
            ...h,
            occupancyRate: h.total_capacity ? Math.round((h.occupied_beds / h.total_capacity) * 100) : 0
          }))
        }
      });
    }

    // Memory Store stats
    const stats = db.memoryStore.getStats();
    const hostelBreakdown = db.memoryStore.hostels.map(h => {
      const rooms = db.memoryStore.rooms.filter(r => r.hostel_id === h.id);
      const occupied = rooms.reduce((acc, r) => acc + (r.occupied_beds || 0), 0);
      return {
        id: h.id,
        name: h.name,
        code: h.code,
        type: h.type,
        total_capacity: h.total_capacity,
        room_count: rooms.length,
        occupied_beds: occupied,
        occupancyRate: h.total_capacity ? Math.round((occupied / h.total_capacity) * 100) : 0
      };
    });

    res.json({
      success: true,
      data: {
        ...stats,
        hostelBreakdown
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
