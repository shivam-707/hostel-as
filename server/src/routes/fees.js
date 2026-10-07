const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/fees - List fee records
router.get('/', async (req, res) => {
  try {
    const { status, student_id } = req.query;

    if (db.isConnected && db.pool) {
      let query = `
        SELECT f.*, s.name as student_name, s.roll_number as student_roll,
               s.department as student_dept, h.name as hostel_name
        FROM fee_records f
        JOIN students s ON f.student_id = s.id
        LEFT JOIN hostels h ON s.hostel_id = h.id
        WHERE 1=1
      `;
      const params = [];
      if (status) {
        query += ' AND f.status = ?';
        params.push(status);
      }
      if (student_id) {
        query += ' AND f.student_id = ?';
        params.push(parseInt(student_id, 10));
      }
      query += ' ORDER BY f.id DESC';
      const [fees] = await db.pool.query(query, params);
      return res.json({ success: true, count: fees.length, data: fees });
    }

    // Memory Store
    let list = [...db.memoryStore.fees];
    if (status) {
      list = list.filter(f => f.status === status);
    }
    if (student_id) {
      list = list.filter(f => f.student_id === parseInt(student_id, 10));
    }

    const data = list.map(f => {
      const s = db.memoryStore.students.find(x => x.id === f.student_id);
      const h = s ? db.memoryStore.hostels.find(x => x.id === s.hostel_id) : null;
      return {
        ...f,
        student_name: s ? s.name : 'Unknown',
        student_roll: s ? s.roll_number : 'N/A',
        student_dept: s ? s.department : 'N/A',
        hostel_name: h ? h.name : 'N/A'
      };
    });

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/fees/pay - Record fee payment
router.post('/pay', async (req, res) => {
  try {
    const { fee_id, amount_paying, payment_method, transaction_ref } = req.body;
    if (!fee_id || !amount_paying) {
      return res.status(400).json({ success: false, error: 'Fee ID and payment amount required' });
    }

    const payAmount = Number(amount_paying);

    if (db.isConnected && db.pool) {
      const [rows] = await db.pool.query('SELECT * FROM fee_records WHERE id = ?', [fee_id]);
      if (!rows.length) return res.status(404).json({ success: false, error: 'Fee record not found' });
      const record = rows[0];

      const newPaid = Number(record.paid_amount) + payAmount;
      const newDue = Math.max(0, Number(record.total_amount) - newPaid);
      const newStatus = newDue <= 0 ? 'paid' : (newPaid > 0 ? 'partial' : 'pending');

      await db.pool.query(
        'UPDATE fee_records SET paid_amount = ?, due_amount = ?, status = ?, payment_method = ?, transaction_ref = ? WHERE id = ?',
        [newPaid, newDue, newStatus, payment_method || 'Online Payment', transaction_ref || `TXN${Date.now()}`, fee_id]
      );

      return res.json({ success: true, message: 'Payment recorded successfully' });
    }

    const fee = db.memoryStore.fees.find(f => f.id === parseInt(fee_id, 10));
    if (!fee) return res.status(404).json({ success: false, error: 'Fee record not found' });

    fee.paid_amount = Number(fee.paid_amount || 0) + payAmount;
    fee.due_amount = Math.max(0, Number(fee.total_amount) - fee.paid_amount);
    fee.status = fee.due_amount <= 0 ? 'paid' : (fee.paid_amount > 0 ? 'partial' : 'pending');
    fee.payment_method = payment_method || 'Online Payment';
    fee.transaction_ref = transaction_ref || `TXN${Date.now()}`;

    db.memoryStore.saveToDisk();
    res.json({ success: true, message: 'Payment recorded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
