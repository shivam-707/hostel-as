const express = require('express');
const router = express.Router();
const db = require('../config/db');

// POST /api/allocations/assign - Assign student to a bed
router.post('/assign', async (req, res) => {
  try {
    const { student_id, hostel_id, room_id, bed_id, remarks } = req.body;
    if (!student_id || !hostel_id || !room_id || !bed_id) {
      return res.status(400).json({ success: false, error: 'Student, Hostel, Room, and Bed are required' });
    }

    if (db.isConnected && db.pool) {
      // Check bed availability
      const [beds] = await db.pool.query('SELECT * FROM beds WHERE id = ?', [bed_id]);
      if (!beds.length) return res.status(404).json({ success: false, error: 'Bed not found' });
      if (beds[0].status === 'occupied') {
        return res.status(400).json({ success: false, error: 'Selected bed is already occupied' });
      }

      // Check student & gender matching
      const [students] = await db.pool.query('SELECT * FROM students WHERE id = ?', [student_id]);
      if (!students.length) return res.status(404).json({ success: false, error: 'Student not found' });
      const student = students[0];

      const [hostels] = await db.pool.query('SELECT * FROM hostels WHERE id = ?', [hostel_id]);
      if (!hostels.length) return res.status(404).json({ success: false, error: 'Hostel not found' });
      const hostel = hostels[0];

      if (student.gender === 'male' && hostel.type !== 'boys') {
        return res.status(400).json({ success: false, error: 'Male students can only be allocated to Boys Hostels' });
      }
      if (student.gender === 'female' && hostel.type !== 'girls') {
        return res.status(400).json({ success: false, error: 'Female students can only be allocated to Girls Hostel' });
      }

      // Transaction-like update
      await db.pool.query('UPDATE beds SET status = "occupied", student_id = ? WHERE id = ?', [student_id, bed_id]);
      await db.pool.query('UPDATE rooms SET occupied_beds = occupied_beds + 1 WHERE id = ?', [room_id]);
      await db.pool.query('UPDATE rooms SET status = "full" WHERE id = ? AND occupied_beds >= capacity', [room_id]);
      await db.pool.query('UPDATE students SET hostel_id = ?, room_id = ?, bed_id = ? WHERE id = ?', [hostel_id, room_id, bed_id, student_id]);
      await db.pool.query(
        'INSERT INTO allocations (student_id, hostel_id, room_id, bed_id, allocated_date, status, remarks) VALUES (?, ?, ?, ?, CURDATE(), "active", ?)',
        [student_id, hostel_id, room_id, bed_id, remarks || 'Initial Room Allocation']
      );

      return res.json({ success: true, message: 'Bed allocated successfully' });
    }

    // Memory Store Implementation
    const bed = db.memoryStore.beds.find(b => b.id === parseInt(bed_id, 10));
    if (!bed) return res.status(404).json({ success: false, error: 'Bed not found' });
    if (bed.status === 'occupied') return res.status(400).json({ success: false, error: 'Selected bed is already occupied' });

    const student = db.memoryStore.students.find(s => s.id === parseInt(student_id, 10));
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

    const hostel = db.memoryStore.hostels.find(h => h.id === parseInt(hostel_id, 10));
    if (!hostel) return res.status(404).json({ success: false, error: 'Hostel not found' });

    if (student.gender === 'male' && hostel.type !== 'boys') {
      return res.status(400).json({ success: false, error: 'Male students can only be allocated to Boys Hostels' });
    }
    if (student.gender === 'female' && hostel.type !== 'girls') {
      return res.status(400).json({ success: false, error: 'Female students can only be allocated to Girls Hostel' });
    }

    // Clear old allocation if student was already allocated
    if (student.bed_id) {
      const oldBed = db.memoryStore.beds.find(b => b.id === student.bed_id);
      if (oldBed) {
        oldBed.status = 'vacant';
        oldBed.student_id = null;
      }
      const oldRoom = db.memoryStore.rooms.find(r => r.id === student.room_id);
      if (oldRoom && oldRoom.occupied_beds > 0) {
        oldRoom.occupied_beds -= 1;
        if (oldRoom.status === 'full') oldRoom.status = 'available';
      }
    }

    // Set new allocation
    bed.status = 'occupied';
    bed.student_id = student.id;

    const room = db.memoryStore.rooms.find(r => r.id === parseInt(room_id, 10));
    if (room) {
      room.occupied_beds = (room.occupied_beds || 0) + 1;
      if (room.occupied_beds >= room.capacity) room.status = 'full';
    }

    student.hostel_id = parseInt(hostel_id, 10);
    student.room_id = parseInt(room_id, 10);
    student.bed_id = parseInt(bed_id, 10);

    db.memoryStore.saveToDisk();
    res.json({ success: true, message: 'Bed allocated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/allocations/vacate - Vacate student from room
router.post('/vacate', async (req, res) => {
  try {
    const { student_id } = req.body;
    if (!student_id) return res.status(400).json({ success: false, error: 'Student ID required' });

    if (db.isConnected && db.pool) {
      const [students] = await db.pool.query('SELECT * FROM students WHERE id = ?', [student_id]);
      if (!students.length) return res.status(404).json({ success: false, error: 'Student not found' });
      const student = students[0];

      if (student.bed_id) {
        await db.pool.query('UPDATE beds SET status = "vacant", student_id = NULL WHERE id = ?', [student.bed_id]);
      }
      if (student.room_id) {
        await db.pool.query('UPDATE rooms SET occupied_beds = GREATEST(0, occupied_beds - 1), status = "available" WHERE id = ?', [student.room_id]);
      }
      await db.pool.query('UPDATE students SET hostel_id = NULL, room_id = NULL, bed_id = NULL WHERE id = ?', [student_id]);
      await db.pool.query('UPDATE allocations SET vacated_date = CURDATE(), status = "vacated" WHERE student_id = ? AND status = "active"', [student_id]);

      return res.json({ success: true, message: 'Student vacated successfully' });
    }

    const student = db.memoryStore.students.find(s => s.id === parseInt(student_id, 10));
    if (!student) return res.status(404).json({ success: false, error: 'Student not found' });

    if (student.bed_id) {
      const bed = db.memoryStore.beds.find(b => b.id === student.bed_id);
      if (bed) {
        bed.status = 'vacant';
        bed.student_id = null;
      }
    }
    if (student.room_id) {
      const room = db.memoryStore.rooms.find(r => r.id === student.room_id);
      if (room && room.occupied_beds > 0) {
        room.occupied_beds -= 1;
        room.status = 'available';
      }
    }

    student.hostel_id = null;
    student.room_id = null;
    student.bed_id = null;

    db.memoryStore.saveToDisk();
    res.json({ success: true, message: 'Student vacated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
