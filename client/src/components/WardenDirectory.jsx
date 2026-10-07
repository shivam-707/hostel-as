import React, { useState, useEffect } from 'react';
import { ShieldCheck, Phone, Mail, Building, Award, User, ShieldAlert } from 'lucide-react';
import { fetchWardens } from '../services/api';

export default function WardenDirectory() {
  const [wardens, setWardens] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadWardens();
  }, []);

  const loadWardens = async () => {
    setLoading(true);
    try {
      const res = await fetchWardens();
      if (res.success) {
        setWardens(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chiefWarden = wardens.find(w => w.role === 'chief_warden');
  const hostelWardens = wardens.filter(w => w.role !== 'chief_warden');

  return (
    <div>
      {/* Chief Warden Feature Card */}
      {chiefWarden && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(30, 41, 59, 0.9) 100%)',
          border: '1px solid var(--border-accent)',
          borderRadius: 'var(--radius-lg)',
          padding: '28px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--gradient-brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 20px var(--primary-glow)'
            }}>
              <ShieldCheck size={36} />
            </div>
            <div>
              <span className="status-badge" style={{ background: 'rgba(99, 102, 241, 0.3)', color: '#818cf8', marginBottom: '6px' }}>
                Chief Warden & Dean Student Affairs
              </span>
              <h3 style={{ fontSize: '1.45rem', fontWeight: '800' }}>{chiefWarden.name}</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {chiefWarden.qualification} • Office: {chiefWarden.office_room}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              <Phone size={15} color="var(--primary)" /> {chiefWarden.phone}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
              <Mail size={15} color="var(--accent-cyan)" /> {chiefWarden.email}
            </div>
          </div>
        </div>
      )}

      {/* 5 Hostel Wardens Grid */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '16px' }}>
        Resident Hostel Wardens ({hostelWardens.length})
      </h3>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading wardens directory...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {hostelWardens.map(w => {
            const isGirls = w.assigned_hostel_code === 'GH-1';

            return (
              <div
                key={w.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  borderLeft: `4px solid ${isGirls ? '#ec4899' : '#3b82f6'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '22px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', color: isGirls ? '#f472b6' : '#60a5fa' }}>
                      {w.assigned_hostel_code} • {isGirls ? 'Girls Hostel' : 'Boys Hostel'}
                    </span>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: '800', marginTop: '2px' }}>{w.name}</h4>
                  </div>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isGirls ? '#ec4899' : '#3b82f6'
                  }}>
                    <User size={18} />
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  {w.qualification}
                </div>

                <div style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Assigned Hostel:</span>
                    <span style={{ fontWeight: '700' }}>{w.assigned_hostel_name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Office Location:</span>
                    <span>{w.office_room}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Phone Contact:</span>
                    <span style={{ fontWeight: '700', color: 'var(--accent-emerald)' }}>{w.phone}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Email ID:</span>
                    <span>{w.email}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
