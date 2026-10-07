import React, { useState, useEffect } from 'react';
import { KeyRound, PlusCircle, Check, XCircle, ArrowUpRight, ArrowDownLeft, X, Clock } from 'lucide-react';
import { fetchGatePasses, requestGatePass, updateGatePassStatus, fetchStudents } from '../services/api';

export default function GatePassManager() {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    student_id: '',
    destination: '',
    reason: '',
    out_time: '',
    expected_in_time: ''
  });

  useEffect(() => {
    loadPasses();
  }, [statusFilter]);

  const loadPasses = async () => {
    setLoading(true);
    try {
      const res = await fetchGatePasses({ status: statusFilter });
      if (res.success) {
        setPasses(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewModal = async () => {
    setIsModalOpen(true);
    setFeedback(null);
    try {
      const res = await fetchStudents();
      if (res.success && res.data.length > 0) {
        setStudents(res.data);
        setFormData(prev => ({ ...prev, student_id: res.data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await requestGatePass(formData);
      if (res.success) {
        setFeedback({ type: 'success', text: 'Gate pass requested! Sent to warden for approval.' });
        loadPasses();
        setTimeout(() => {
          setIsModalOpen(false);
          setFormData({
            student_id: students[0]?.id || '',
            destination: '',
            reason: '',
            out_time: '',
            expected_in_time: ''
          });
        }, 1200);
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to request gate pass' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, nextStatus) => {
    try {
      const res = await updateGatePassStatus(id, {
        status: nextStatus,
        approved_by_warden_id: nextStatus === 'approved' ? 1 : null,
        guard_notes: nextStatus === 'checked_out' ? 'Verified student ID at main gate' : null
      });
      if (res.success) {
        loadPasses();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="table-wrapper">
        <div className="table-header-toolbar">
          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Pass Statuses</option>
              <option value="pending">Pending Warden Approval</option>
              <option value="approved">Approved (Awaiting Checkout)</option>
              <option value="checked_out">Currently Outside Campus</option>
              <option value="returned">Returned Safe</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={handleOpenNewModal}>
            <PlusCircle size={16} /> Request Outpass
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Pass ID</th>
                <th>Student</th>
                <th>Hostel Block</th>
                <th>Destination & Reason</th>
                <th>Departure Time</th>
                <th>Expected Return</th>
                <th>Status</th>
                <th>Approval</th>
                <th>Gate Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>Loading outpasses...</td>
                </tr>
              ) : passes.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>No active gate passes found.</td>
                </tr>
              ) : (
                passes.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: '700' }}>#{p.id}</td>
                    <td className="primary-cell">
                      <div>{p.student_name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{p.student_roll}</div>
                    </td>
                    <td>{p.hostel_name}</td>
                    <td>
                      <div style={{ fontWeight: '700' }}>{p.destination}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{p.reason}</div>
                    </td>
                    <td>{p.out_time ? String(p.out_time).substring(0, 16).replace('T', ' ') : 'N/A'}</td>
                    <td>{p.expected_in_time ? String(p.expected_in_time).substring(0, 16).replace('T', ' ') : 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${p.status}`}>
                        {p.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{p.approver_warden_name || 'Pending Review'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {p.status === 'pending' && (
                          <button
                            className="btn-sm btn-primary"
                            onClick={() => handleStatusUpdate(p.id, 'approved')}
                          >
                            Approve
                          </button>
                        )}
                        {p.status === 'approved' && (
                          <button
                            className="btn-sm btn-secondary"
                            onClick={() => handleStatusUpdate(p.id, 'checked_out')}
                            style={{ color: '#fbbf24' }}
                          >
                            <ArrowUpRight size={13} /> Exit Gate
                          </button>
                        )}
                        {p.status === 'checked_out' && (
                          <button
                            className="btn-sm btn-primary"
                            onClick={() => handleStatusUpdate(p.id, 'returned')}
                            style={{ background: '#10b981' }}
                          >
                            <ArrowDownLeft size={13} /> Return Gate
                          </button>
                        )}
                        {p.status === 'returned' && (
                          <span style={{ fontSize: '0.74rem', color: 'var(--accent-emerald)', fontWeight: '700' }}>
                            ✓ In Hostel
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Gate Pass Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Request Student Gate Pass / Leave</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
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

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Student</label>
                <select
                  className="form-select"
                  value={formData.student_id}
                  onChange={e => setFormData({ ...formData, student_id: e.target.value })}
                  required
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.roll_number}) - {s.hostel_name || 'Hostel'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Destination (City / Place)</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Hometown visit, Local market, Medical Clinic"
                  value={formData.destination}
                  onChange={e => setFormData({ ...formData, destination: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Purpose / Reason</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Official reason for outpass"
                  value={formData.reason}
                  onChange={e => setFormData({ ...formData, reason: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Departure Date & Time</label>
                  <input
                    className="form-input"
                    type="datetime-local"
                    value={formData.out_time}
                    onChange={e => setFormData({ ...formData, out_time: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Return Date & Time</label>
                  <input
                    className="form-input"
                    type="datetime-local"
                    value={formData.expected_in_time}
                    onChange={e => setFormData({ ...formData, expected_in_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Issue Gate Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
