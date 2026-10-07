import React, { useState, useEffect } from 'react';
import {
  Bed,
  Wind,
  Layers,
  Filter,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Search,
  Eye,
  X,
  Building2,
  DollarSign
} from 'lucide-react';
import { fetchRooms, fetchRoomDetails, assignBed, vacateBed, fetchStudents } from '../services/api';

export default function RoomMatrix({ hostels, preselectedHostelId }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState(preselectedHostelId || '1');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedClimate, setSelectedClimate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modal states
  const [activeRoomModal, setActiveRoomModal] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [selectedBedToAssign, setSelectedBedToAssign] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [modalFeedback, setModalFeedback] = useState(null);

  useEffect(() => {
    if (preselectedHostelId) {
      setSelectedHostel(String(preselectedHostelId));
    }
  }, [preselectedHostelId]);

  useEffect(() => {
    loadRooms();
  }, [selectedHostel, selectedFloor, selectedType, selectedClimate, selectedStatus]);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const res = await fetchRooms({
        hostel_id: selectedHostel,
        floor: selectedFloor,
        room_type: selectedType,
        climate_type: selectedClimate,
        status: selectedStatus
      });
      if (res.success) {
        setRooms(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRoomModal = async (roomId) => {
    setModalFeedback(null);
    setSelectedBedToAssign(null);
    setSelectedStudentId('');
    try {
      const res = await fetchRoomDetails(roomId);
      if (res.success) {
        setActiveRoomModal(res.data);
        // Load unallocated students or students of appropriate gender
        const studRes = await fetchStudents();
        if (studRes.success) {
          setStudentsList(studRes.data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignBed = async (e) => {
    e.preventDefault();
    if (!selectedBedToAssign || !selectedStudentId) return;
    setAssigning(true);
    setModalFeedback(null);
    try {
      const res = await assignBed({
        student_id: selectedStudentId,
        hostel_id: activeRoomModal.hostel_id,
        room_id: activeRoomModal.id,
        bed_id: selectedBedToAssign.id,
        remarks: 'Assigned via Room Matrix'
      });
      if (res.success) {
        setModalFeedback({ type: 'success', text: 'Bed successfully allocated!' });
        // Refresh room details and room list
        const refreshed = await fetchRoomDetails(activeRoomModal.id);
        if (refreshed.success) setActiveRoomModal(refreshed.data);
        loadRooms();
        setSelectedBedToAssign(null);
        setSelectedStudentId('');
      } else {
        setModalFeedback({ type: 'error', text: res.error || 'Allocation failed' });
      }
    } catch (err) {
      setModalFeedback({ type: 'error', text: err.message });
    } finally {
      setAssigning(false);
    }
  };

  const handleVacateStudent = async (studentId) => {
    if (!window.confirm('Are you sure you want to vacate this student from this bed?')) return;
    try {
      const res = await vacateBed({ student_id: studentId });
      if (res.success) {
        setModalFeedback({ type: 'success', text: 'Bed vacated successfully!' });
        const refreshed = await fetchRoomDetails(activeRoomModal.id);
        if (refreshed.success) setActiveRoomModal(refreshed.data);
        loadRooms();
      } else {
        setModalFeedback({ type: 'error', text: res.error || 'Vacate failed' });
      }
    } catch (err) {
      setModalFeedback({ type: 'error', text: err.message });
    }
  };

  // Quick stats for current filter
  const totalBedsInView = rooms.reduce((acc, r) => acc + r.capacity, 0);
  const occupiedBedsInView = rooms.reduce((acc, r) => acc + (r.occupied_beds || 0), 0);
  const vacantBedsInView = totalBedsInView - occupiedBedsInView;

  return (
    <div>
      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)' }}>HOSTEL:</label>
          <select
            className="filter-select"
            value={selectedHostel}
            onChange={e => setSelectedHostel(e.target.value)}
          >
            {hostels.map(h => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.code}) - {h.type.toUpperCase()}
              </option>
            ))}
          </select>

          <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', marginLeft: '8px' }}>FLOOR:</label>
          <select
            className="filter-select"
            value={selectedFloor}
            onChange={e => setSelectedFloor(e.target.value)}
          >
            <option value="">All 4 Floors</option>
            <option value="0">Ground Floor (Rooms 001 - 020)</option>
            <option value="1">1st Floor (Rooms 101 - 120)</option>
            <option value="2">2nd Floor (Rooms 201 - 220)</option>
            <option value="3">3rd Floor (Rooms 301 - 320)</option>
          </select>
        </div>

        <div className="filter-group">
          <select
            className="filter-select"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
          >
            <option value="">All Room Capacities</option>
            <option value="2_seater">2-Seater (2 Beds)</option>
            <option value="3_seater">3-Seater (3 Beds)</option>
          </select>

          <select
            className="filter-select"
            value={selectedClimate}
            onChange={e => setSelectedClimate(e.target.value)}
          >
            <option value="">All Climates</option>
            <option value="ac">Air Conditioned (AC)</option>
            <option value="non_ac">Non-AC</option>
          </select>

          <select
            className="filter-select"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="available">Has Vacancy</option>
            <option value="full">Fully Occupied</option>
          </select>
        </div>
      </div>

      {/* Summary Pills Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
        padding: '12px 18px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.84rem'
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span>Showing <strong>{rooms.length}</strong> Rooms</span>
          <span>• Total Beds: <strong>{totalBedsInView}</strong></span>
          <span style={{ color: 'var(--accent-emerald)' }}>• Vacant Beds: <strong>{vacantBedsInView}</strong></span>
          <span style={{ color: 'var(--accent-cyan)' }}>• Occupied Beds: <strong>{occupiedBedsInView}</strong></span>
        </div>
        <div style={{ color: 'var(--text-muted)' }}>
          Tip: Click any room card or bed slot to view occupant details or allocate beds.
        </div>
      </div>

      {/* Matrix Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading rooms inventory...</div>
      ) : rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No rooms matched the selected filter.</div>
      ) : (
        <div className="rooms-matrix-grid">
          {rooms.map(room => {
            const isFull = room.occupied_beds >= room.capacity;
            const isAC = room.climate_type === 'ac';
            const isTwo = room.room_type === '2_seater';

            return (
              <div
                key={room.id}
                className="room-card"
                onClick={() => handleOpenRoomModal(room.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="room-card-header">
                  <span className="room-badge-num">Room #{room.room_number}</span>
                  <div className="room-tags">
                    <span className={`tag-pill ${isAC ? 'ac' : 'non-ac'}`}>{isAC ? 'AC' : 'Non-AC'}</span>
                    <span className={`tag-pill ${isFull ? 'full' : 'available'}`}>{isFull ? 'FULL' : 'VACANT'}</span>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Floor {room.floor_number === 0 ? 'G (Ground)' : room.floor_number} • {isTwo ? '2-Seater' : '3-Seater'}
                </div>

                {/* Bed Representation */}
                <div className="beds-container">
                  {Array.from({ length: room.capacity }).map((_, idx) => {
                    const letter = String.fromCharCode(65 + idx); // A, B, C
                    const isOccupied = idx < (room.occupied_beds || 0);

                    return (
                      <div
                        key={letter}
                        className={`bed-slot ${isOccupied ? 'occupied' : 'vacant'}`}
                        title={isOccupied ? `Bed ${letter}: Occupied` : `Bed ${letter}: Vacant - Click to allocate`}
                      >
                        <Bed size={15} color={isOccupied ? '#818cf8' : '#10b981'} />
                        <span className="bed-letter">Bed {letter}</span>
                        <span className="bed-status-indicator">{isOccupied ? 'Occupied' : 'Vacant'}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="room-card-footer">
                  <span>₹{Number(room.fee_per_semester).toLocaleString('en-IN')}/sem</span>
                  <span style={{ fontWeight: '700', color: isFull ? 'var(--accent-rose)' : 'var(--accent-emerald)' }}>
                    {room.occupied_beds || 0}/{room.capacity} Beds
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Room Details & Bed Allocation Modal */}
      {activeRoomModal && (
        <div className="modal-overlay" onClick={() => setActiveRoomModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">
                  {activeRoomModal.hostel_name} • Room #{activeRoomModal.room_number}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Floor {activeRoomModal.floor_number} • {activeRoomModal.room_type.replace('_', '-').toUpperCase()} • {activeRoomModal.climate_type.toUpperCase()}
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setActiveRoomModal(null)}>
                <X size={20} />
              </button>
            </div>

            {modalFeedback && (
              <div style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '16px',
                fontSize: '0.86rem',
                fontWeight: '600',
                background: modalFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                color: modalFeedback.type === 'success' ? '#34d399' : '#fb7185',
                border: `1px solid ${modalFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
              }}>
                {modalFeedback.text}
              </div>
            )}

            {/* Bed Slots Detailed Table */}
            <h4 style={{ fontSize: '0.92rem', fontWeight: '800', marginBottom: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Bed Allocations in Room
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {activeRoomModal.beds?.map(bed => {
                const isOccupied = bed.status === 'occupied';

                return (
                  <div
                    key={bed.id}
                    style={{
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      background: isOccupied ? 'rgba(99, 102, 241, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                      border: `1px solid ${isOccupied ? 'rgba(99, 102, 241, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        background: isOccupied ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        color: isOccupied ? '#818cf8' : '#34d399'
                      }}>
                        {bed.bed_letter}
                      </div>

                      <div>
                        {isOccupied ? (
                          <>
                            <div style={{ fontWeight: '800', color: 'var(--text-primary)' }}>{bed.student_name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              Roll: {bed.student_roll} • Dept: {bed.student_dept} • Ph: {bed.student_phone}
                            </div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontWeight: '700', color: 'var(--accent-emerald)' }}>Bed {bed.bed_letter} is Vacant</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Ready for immediate student allocation</div>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      {isOccupied ? (
                        <button
                          className="btn-sm btn-secondary"
                          onClick={() => handleVacateStudent(bed.student_id)}
                          style={{ color: '#fb7185', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                        >
                          <UserX size={14} /> Vacate Bed
                        </button>
                      ) : (
                        <button
                          className="btn-sm btn-primary"
                          onClick={() => setSelectedBedToAssign(bed)}
                        >
                          <UserCheck size={14} /> Allocate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Allocate Bed Form if a vacant bed was selected */}
            {selectedBedToAssign && (
              <form onSubmit={handleAssignBed} style={{
                padding: '18px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-accent)',
                marginTop: '10px'
              }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '12px', color: 'var(--primary)' }}>
                  Assign Student to Bed {selectedBedToAssign.bed_letter}
                </h4>

                <div className="form-group">
                  <label className="form-label">Select Student</label>
                  <select
                    className="form-select"
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose admitted student --</option>
                    {studentsList.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.roll_number}) - {s.gender.toUpperCase()} - {s.department} {s.bed_id ? `[Currently in Bed #${s.bed_id}]` : '[Unassigned]'}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" className="btn-sm btn-secondary" onClick={() => setSelectedBedToAssign(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-sm btn-primary" disabled={assigning}>
                    {assigning ? 'Assigning...' : 'Confirm Bed Allocation'}
                  </button>
                </div>
              </form>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-secondary" onClick={() => setActiveRoomModal(null)}>
                Close Room Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
