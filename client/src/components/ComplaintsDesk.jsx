import React, { useState, useEffect } from 'react';
import {
  Wrench,
  PlusCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Droplet,
  Wifi,
  Hammer,
  Sparkles,
  X
} from 'lucide-react';
import { fetchComplaints, createComplaint, updateComplaint, fetchStudents, fetchHostels } from '../services/api';

export default function ComplaintsDesk({ hostels }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // New ticket modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    student_id: '',
    hostel_id: '1',
    category: 'electrical',
    title: '',
    description: '',
    priority: 'medium'
  });

  useEffect(() => {
    loadComplaints();
  }, [statusFilter, categoryFilter]);

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetchComplaints({
        status: statusFilter,
        category: categoryFilter
      });
      if (res.success) {
        setComplaints(res.data);
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
      const res = await createComplaint(formData);
      if (res.success) {
        setFeedback({ type: 'success', text: 'Ticket successfully filed with maintenance desk!' });
        loadComplaints();
        setTimeout(() => {
          setIsModalOpen(false);
          setFormData({
            student_id: students[0]?.id || '',
            hostel_id: '1',
            category: 'electrical',
            title: '',
            description: '',
            priority: 'medium'
          });
        }, 1200);
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to file ticket' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, nextStatus) => {
    try {
      const res = await updateComplaint(id, {
        status: nextStatus,
        resolution_notes: nextStatus === 'resolved' ? 'Inspected and repaired by hostel engineering unit.' : null
      });
      if (res.success) {
        loadComplaints();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'electrical': return <Zap size={16} color="#fbbf24" />;
      case 'plumbing': return <Droplet size={16} color="#38bdf8" />;
      case 'wifi': return <Wifi size={16} color="#a855f7" />;
      case 'carpentry': return <Hammer size={16} color="#f97316" />;
      default: return <Wrench size={16} color="#94a3b8" />;
    }
  };

  return (
    <div>
      {/* Top action bar */}
      <div className="table-wrapper">
        <div className="table-header-toolbar">
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="">All Ticket Statuses</option>
              <option value="open">Open (Unresolved)</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              className="filter-select"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            >
              <option value="">All Issue Categories</option>
              <option value="electrical">Electrical & Appliances</option>
              <option value="plumbing">Plumbing & Water</option>
              <option value="wifi">Campus Wi-Fi / LAN</option>
              <option value="carpentry">Carpentry & Furniture</option>
              <option value="cleaning">Housekeeping</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={handleOpenNewModal}>
            <PlusCircle size={16} /> Lodge New Grievance
          </button>
        </div>

        {/* Tickets Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Category</th>
                <th>Issue Summary</th>
                <th>Hostel & Room</th>
                <th>Raised By</th>
                <th>Priority</th>
                <th>Current Status</th>
                <th>Assigned Tech</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>Loading grievance tickets...</td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>No maintenance tickets registered.</td>
                </tr>
              ) : (
                complaints.map(t => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: '700' }}>#{t.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'capitalize' }}>
                        {getCategoryIcon(t.category)}
                        <span>{t.category}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{t.title}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{t.description}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{t.hostel_name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {t.room_number ? `Room #${t.room_number}` : 'Common Area'}
                      </div>
                    </td>
                    <td>
                      <div>{t.student_name}</div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{t.student_roll}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${t.priority}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${t.status}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{t.assigned_to || 'Hostel Duty Desk'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {t.status === 'open' && (
                          <button
                            className="btn-sm btn-secondary"
                            onClick={() => handleStatusChange(t.id, 'in_progress')}
                          >
                            Assign / In Progress
                          </button>
                        )}
                        {t.status === 'in_progress' && (
                          <button
                            className="btn-sm btn-primary"
                            onClick={() => handleStatusChange(t.id, 'resolved')}
                          >
                            Resolve
                          </button>
                        )}
                        {t.status === 'resolved' && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '700' }}>
                            ✓ Closed
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

      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Lodge Maintenance Grievance</h3>
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
                <label className="form-label">Student Lodging Complaint</label>
                <select
                  className="form-select"
                  value={formData.student_id}
                  onChange={e => {
                    const sid = e.target.value;
                    const st = students.find(s => String(s.id) === sid);
                    setFormData({
                      ...formData,
                      student_id: sid,
                      hostel_id: st?.hostel_id || formData.hostel_id
                    });
                  }}
                  required
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.roll_number}) - {s.hostel_name || 'Hostel'} {s.room_number ? `#${s.room_number}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="electrical">Electrical (Lights, Fan, AC)</option>
                    <option value="plumbing">Plumbing (Tap, Drainage, Geyser)</option>
                    <option value="wifi">Campus Wi-Fi / Internet</option>
                    <option value="carpentry">Carpentry & Furniture</option>
                    <option value="cleaning">Housekeeping & Hygiene</option>
                    <option value="other">Other Campus Issue</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Urgency Priority</label>
                  <select
                    className="form-select"
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low (General)</option>
                    <option value="medium">Medium (Standard)</option>
                    <option value="high">High (Urgent Attention)</option>
                    <option value="emergency">Emergency (Immediate Hazard)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Issue Headline</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Geyser tripping circuit breaker"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Please specify room number, location, and nature of breakdown..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
