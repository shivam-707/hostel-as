import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Building,
  GraduationCap,
  Phone,
  Mail,
  UserCheck,
  UserX,
  X,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { fetchStudents, admitStudent, vacateBed } from '../services/api';

export default function StudentDirectory({ hostels, onNavigateToRooms }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [hostelFilter, setHostelFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Admit modal
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const [formData, setFormData] = useState({
    roll_number: '',
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    department: 'Computer Science',
    year_of_study: 1,
    guardian_name: '',
    guardian_phone: '',
    blood_group: 'B+',
    address: ''
  });

  useEffect(() => {
    loadStudents();
  }, [search, hostelFilter, deptFilter]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await fetchStudents({
        search,
        hostel_id: hostelFilter,
        department: deptFilter
      });
      if (res.success) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await admitStudent(formData);
      if (res.success) {
        setFeedback({ type: 'success', text: 'Student enrolled successfully! You can now allocate a room.' });
        loadStudents();
        setTimeout(() => {
          setIsAdmitModalOpen(false);
          setFeedback(null);
          setFormData({
            roll_number: '',
            name: '',
            email: '',
            phone: '',
            gender: 'male',
            department: 'Computer Science',
            year_of_study: 1,
            guardian_name: '',
            guardian_phone: '',
            blood_group: 'B+',
            address: ''
          });
        }, 1200);
      } else {
        setFeedback({ type: 'error', text: res.error || 'Failed to enroll student' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVacate = async (studentId) => {
    if (!window.confirm('Are you sure you want to vacate this student?')) return;
    try {
      const res = await vacateBed({ student_id: studentId });
      if (res.success) {
        loadStudents();
      } else {
        alert(res.error || 'Vacate failed');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Table Toolbar */}
      <div className="table-wrapper">
        <div className="table-header-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="search-input-wrap">
              <Search className="search-icon-pos" size={16} />
              <input
                className="search-input"
                type="text"
                placeholder="Search by name, roll no, email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              value={hostelFilter}
              onChange={e => setHostelFilter(e.target.value)}
            >
              <option value="">All Campus Hostels</option>
              {hostels.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>

            <select
              className="filter-select"
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mechanical Engg.">Mechanical Engg.</option>
              <option value="Electrical Engg.">Electrical Engg.</option>
              <option value="Civil Engg.">Civil Engg.</option>
              <option value="Electronics & Comm.">Electronics & Comm.</option>
              <option value="Information Tech.">Information Tech.</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={() => setIsAdmitModalOpen(true)}>
            <UserPlus size={16} /> Admit Student
          </button>
        </div>

        {/* Students Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Profile</th>
                <th>Department & Year</th>
                <th>Hostel & Room</th>
                <th>Bed Allocation</th>
                <th>Guardian Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Loading students directory...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>No student records found.</td>
                </tr>
              ) : (
                students.map(s => {
                  const hasRoom = Boolean(s.hostel_name && s.room_number);

                  return (
                    <tr key={s.id}>
                      <td className="primary-cell" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                        {s.roll_number}
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{s.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {s.email} • {s.gender.toUpperCase()}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{s.department}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Year {s.year_of_study}</div>
                      </td>
                      <td>
                        {hasRoom ? (
                          <div>
                            <div style={{ fontWeight: '700', color: s.gender === 'female' ? '#ec4899' : '#3b82f6' }}>
                              {s.hostel_name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Room #{s.room_number}</div>
                          </div>
                        ) : (
                          <span className="status-badge partial">Pending Allocation</span>
                        )}
                      </td>
                      <td>
                        {s.bed_letter ? (
                          <span className="status-badge active">
                            Bed {s.bed_letter}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No Bed Assigned</span>
                        )}
                      </td>
                      <td>
                        <div>{s.guardian_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.guardian_phone}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {hasRoom ? (
                            <button
                              className="btn-sm btn-secondary"
                              onClick={() => handleVacate(s.id)}
                              style={{ color: '#fb7185' }}
                              title="Vacate from room"
                            >
                              <UserX size={13} /> Vacate
                            </button>
                          ) : (
                            <button
                              className="btn-sm btn-primary"
                              onClick={onNavigateToRooms}
                              title="Open Room Matrix to allocate"
                            >
                              <UserCheck size={13} /> Allocate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admit New Student Modal */}
      {isAdmitModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAdmitModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserPlus size={22} color="var(--primary)" />
                <h3 className="modal-title">New Student Admission & Registration</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setIsAdmitModalOpen(false)}>
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
                color: feedback.type === 'success' ? '#34d399' : '#fb7185',
                border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
              }}>
                {feedback.text}
              </div>
            )}

            <form onSubmit={handleAdmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. 2026CS401"
                    value={formData.roll_number}
                    onChange={e => setFormData({ ...formData, roll_number: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Student's official name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="student@campus.edu"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-input"
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="male">Male (Eligible for 4 Boys Hostels)</option>
                    <option value="female">Female (Eligible for Ganga Girls Hostel)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mechanical Engg.">Mechanical Engg.</option>
                    <option value="Electrical Engg.">Electrical Engg.</option>
                    <option value="Civil Engg.">Civil Engg.</option>
                    <option value="Electronics & Comm.">Electronics & Comm.</option>
                    <option value="Information Tech.">Information Tech.</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Year of Study</label>
                  <select
                    className="form-select"
                    value={formData.year_of_study}
                    onChange={e => setFormData({ ...formData, year_of_study: parseInt(e.target.value, 10) })}
                  >
                    <option value={1}>1st Year (Freshman)</option>
                    <option value={2}>2nd Year (Sophomore)</option>
                    <option value={3}>3rd Year (Junior)</option>
                    <option value={4}>4th Year (Senior)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. O+, B+, A+"
                    value={formData.blood_group}
                    onChange={e => setFormData({ ...formData, blood_group: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Guardian Name</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Parent / Guardian name"
                    value={formData.guardian_name}
                    onChange={e => setFormData({ ...formData, guardian_name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Guardian Phone</label>
                  <input
                    className="form-input"
                    type="tel"
                    placeholder="Emergency contact"
                    value={formData.guardian_phone}
                    onChange={e => setFormData({ ...formData, guardian_phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Permanent Address</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="City, State, Country"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAdmitModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Admit & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
