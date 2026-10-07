import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, CheckCircle2, Clock, AlertCircle, X } from 'lucide-react';
import { fetchFees, payFee } from '../services/api';

export default function FeeLedger() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Payment modal
  const [activePaymentModal, setActivePaymentModal] = useState(null);
  const [amountPaying, setAmountPaying] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paying, setPaying] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    loadFees();
  }, [statusFilter]);

  const loadFees = async () => {
    setLoading(true);
    try {
      const res = await fetchFees({ status: statusFilter });
      if (res.success) {
        setFees(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = (fee) => {
    setActivePaymentModal(fee);
    setAmountPaying(fee.due_amount);
    setFeedback(null);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!activePaymentModal || !amountPaying) return;
    setPaying(true);
    setFeedback(null);
    try {
      const res = await payFee({
        fee_id: activePaymentModal.id,
        amount_paying: amountPaying,
        payment_method: paymentMethod,
        transaction_ref: `TXN${Date.now()}`
      });
      if (res.success) {
        setFeedback({ type: 'success', text: 'Payment successfully processed & receipt generated!' });
        loadFees();
        setTimeout(() => {
          setActivePaymentModal(null);
        }, 1200);
      } else {
        setFeedback({ type: 'error', text: res.error || 'Payment failed' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setPaying(false);
    }
  };

  const totalBilled = fees.reduce((acc, f) => acc + Number(f.total_amount || 0), 0);
  const totalCollected = fees.reduce((acc, f) => acc + Number(f.paid_amount || 0), 0);
  const totalDue = fees.reduce((acc, f) => acc + Number(f.due_amount || 0), 0);

  return (
    <div>
      {/* Metrics Row */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Invoiced</span>
            <div className="stat-icon-wrapper primary"><CreditCard size={20} /></div>
          </div>
          <div className="stat-value">₹{totalBilled.toLocaleString('en-IN')}</div>
          <div className="stat-footer">{fees.length} active fee ledgers</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Collected</span>
            <div className="stat-icon-wrapper emerald"><CheckCircle2 size={20} /></div>
          </div>
          <div className="stat-value">₹{totalCollected.toLocaleString('en-IN')}</div>
          <div className="stat-footer" style={{ color: 'var(--accent-emerald)' }}>
            {totalBilled ? Math.round((totalCollected / totalBilled) * 100) : 0}% collected
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Pending Receivables</span>
            <div className="stat-icon-wrapper amber"><Clock size={20} /></div>
          </div>
          <div className="stat-value">₹{totalDue.toLocaleString('en-IN')}</div>
          <div className="stat-footer" style={{ color: 'var(--accent-amber)' }}>Overdue / Partial balance</div>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-wrapper">
        <div className="table-header-toolbar">
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800' }}>Student Hostel & Mess Fee Records</h3>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Payment Statuses</option>
            <option value="paid">Fully Paid</option>
            <option value="partial">Partially Paid</option>
            <option value="pending">Pending Payment</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No & Dept</th>
                <th>Hostel Block</th>
                <th>Semester & Plan</th>
                <th>Total Invoiced</th>
                <th>Paid Amount</th>
                <th>Balance Due</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>Loading fee records...</td>
                </tr>
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>No fee records found.</td>
                </tr>
              ) : (
                fees.map(fee => (
                  <tr key={fee.id}>
                    <td className="primary-cell">{fee.student_name}</td>
                    <td>
                      <div>{fee.student_roll}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{fee.student_dept}</div>
                    </td>
                    <td>{fee.hostel_name || 'Assigned Block'}</td>
                    <td>
                      <div>{fee.semester}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{fee.fee_type}</div>
                    </td>
                    <td style={{ fontWeight: '700' }}>₹{Number(fee.total_amount).toLocaleString('en-IN')}</td>
                    <td style={{ color: 'var(--accent-emerald)', fontWeight: '700' }}>₹{Number(fee.paid_amount).toLocaleString('en-IN')}</td>
                    <td style={{ color: Number(fee.due_amount) > 0 ? 'var(--accent-rose)' : 'var(--text-muted)', fontWeight: '700' }}>
                      ₹{Number(fee.due_amount).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`status-badge ${fee.status}`}>
                        {fee.status}
                      </span>
                    </td>
                    <td>
                      {Number(fee.due_amount) > 0 ? (
                        <button
                          className="btn-sm btn-primary"
                          onClick={() => handleOpenPayment(fee)}
                        >
                          Collect Fee
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '700' }}>
                          ✓ Settled
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {activePaymentModal && (
        <div className="modal-overlay" onClick={() => setActivePaymentModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Record Fee Payment</h3>
              <button className="modal-close-btn" onClick={() => setActivePaymentModal(null)}>
                <X size={20} />
              </button>
            </div>

            {feedback && (
              <div style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                fontSize: '0.86rem',
                fontWeight: '600',
                background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                color: feedback.type === 'success' ? '#34d399' : '#fb7185'
              }}>
                {feedback.text}
              </div>
            )}

            <form onSubmit={handleRecordPayment}>
              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                marginBottom: '18px',
                fontSize: '0.85rem'
              }}>
                <div>Student: <strong>{activePaymentModal.student_name}</strong> ({activePaymentModal.student_roll})</div>
                <div>Hostel: <strong>{activePaymentModal.hostel_name}</strong></div>
                <div>Current Pending Balance: <strong style={{ color: 'var(--accent-rose)' }}>₹{Number(activePaymentModal.due_amount).toLocaleString('en-IN')}</strong></div>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Amount (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  max={activePaymentModal.due_amount}
                  value={amountPaying}
                  onChange={e => setAmountPaying(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Channel</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="NetBanking">Net Banking / NEFT / RTGS</option>
                  <option value="Debit Card">Debit / Credit Card</option>
                  <option value="Cash / Cheque">Hostel Accounts Cash / Cheque</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActivePaymentModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={paying}>
                  {paying ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
