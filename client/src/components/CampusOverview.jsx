import React from 'react';
import {
  Building2,
  Bed,
  Users,
  Percent,
  CreditCard,
  ShieldAlert,
  ArrowRight,
  Wind,
  Layers,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function CampusOverview({ stats, hostels, onSelectHostel }) {
  const boysHostels = hostels.filter(h => h.type === 'boys');
  const girlsHostels = hostels.filter(h => h.type === 'girls');

  return (
    <div>
      {/* Hero Architecture Card */}
      <section className="campus-hero-banner">
        <div className="hero-headline">
          <div>
            <h2 className="hero-title">Campus Hostel Architecture & Layout</h2>
            <p className="hero-desc">
              Complete administrative overview configured for your university campus. Comprising <strong>4 Boys Hostels</strong> and <strong>1 Girls Hostel</strong> with an automated 80-room multi-tier capacity model across 4 floors.
            </p>
          </div>
          <div className="campus-spec-chips">
            <span className="spec-chip boys">4 Boys Hostels (800 Beds)</span>
            <span className="spec-chip girls">1 Girls Hostel (200 Beds)</span>
            <span className="spec-chip capacity">400 Total Rooms</span>
            <span className="spec-chip wardens">6 Dedicated Wardens</span>
          </div>
        </div>

        {/* Room Configuration Matrix Breakdown */}
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <div className="breakdown-item-header">
              <span>2-Seater AC</span>
              <Wind size={14} color="#06b6d4" />
            </div>
            <div className="breakdown-item-val">20 Rms / Hostel</div>
            <div className="breakdown-item-sub">Ground & 1st Floor (40 beds/hostel • 100 campus rooms)</div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-item-header">
              <span>2-Seater Non-AC</span>
              <Layers size={14} color="#94a3b8" />
            </div>
            <div className="breakdown-item-val">20 Rms / Hostel</div>
            <div className="breakdown-item-sub">Ground & 1st Floor (40 beds/hostel • 100 campus rooms)</div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-item-header">
              <span>3-Seater AC</span>
              <Wind size={14} color="#06b6d4" />
            </div>
            <div className="breakdown-item-val">20 Rms / Hostel</div>
            <div className="breakdown-item-sub">2nd & 3rd Floor (60 beds/hostel • 100 campus rooms)</div>
          </div>

          <div className="breakdown-item">
            <div className="breakdown-item-header">
              <span>3-Seater Non-AC</span>
              <Layers size={14} color="#94a3b8" />
            </div>
            <div className="breakdown-item-val">20 Rms / Hostel</div>
            <div className="breakdown-item-sub">2nd & 3rd Floor (60 beds/hostel • 100 campus rooms)</div>
          </div>
        </div>
      </section>

      {/* KPI Stats Cards */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Hostels Master</span>
            <div className="stat-icon-wrapper primary"><Building2 size={20} /></div>
          </div>
          <div className="stat-value">{stats?.totalHostels || 5}</div>
          <div className="stat-footer">4 Boys Hostels + 1 Girls Hostel</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Rooms</span>
            <div className="stat-icon-wrapper cyan"><Layers size={20} /></div>
          </div>
          <div className="stat-value">{stats?.totalRooms || 400}</div>
          <div className="stat-footer">80 rooms per hostel × 4 floors</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Total Bed Capacity</span>
            <div className="stat-icon-wrapper emerald"><Bed size={20} /></div>
          </div>
          <div className="stat-value">{stats?.totalBeds || 1000}</div>
          <div className="stat-footer">{stats?.availableBeds ?? 992} beds vacant</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Campus Occupancy</span>
            <div className="stat-icon-wrapper amber"><Percent size={20} /></div>
          </div>
          <div className="stat-value">{stats?.occupancyRate || 1}%</div>
          <div className="stat-footer">{stats?.occupiedBeds || 8} occupied beds</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Wardens & Staff</span>
            <div className="stat-icon-wrapper primary"><ShieldAlert size={20} /></div>
          </div>
          <div className="stat-value">{stats?.totalWardens || 6}</div>
          <div className="stat-footer">1 Chief Warden + 5 Hostel Wardens</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-title">Fee Collection</span>
            <div className="stat-icon-wrapper emerald"><CreditCard size={20} /></div>
          </div>
          <div className="stat-value">₹{(stats?.totalFeeCollected || 265000).toLocaleString('en-IN')}</div>
          <div className="stat-footer">Due: ₹{(stats?.totalFeeDue || 80000).toLocaleString('en-IN')}</div>
        </div>
      </section>

      {/* 5 Hostel Block Cards */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Campus Hostels Directory ({hostels.length})</h3>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Click any hostel to view its 80-room floor matrix</span>
      </div>

      <div className="hostel-cards-grid">
        {hostels.map(hostel => {
          const isBoys = hostel.type === 'boys';
          const occupied = hostel.current_occupied || 0;
          const capacity = hostel.total_capacity || 200;
          const pct = Math.round((occupied / capacity) * 100);

          return (
            <div
              key={hostel.id}
              className={`hostel-block-card ${isBoys ? 'boys' : 'girls'}`}
              onClick={() => onSelectHostel(hostel.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="hostel-card-header">
                <div>
                  <span className="hostel-type-tag">{isBoys ? 'Boys Hostel Block' : 'Girls Hostel Block'}</span>
                  <h4 className="hostel-name">{hostel.name}</h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{hostel.location_block}</div>
                </div>
                <span className="hostel-code-badge">{hostel.code}</span>
              </div>

              {/* Occupancy Progress */}
              <div className="hostel-progress-wrap">
                <div className="progress-labels">
                  <span>Occupancy ({pct}%)</span>
                  <span><strong>{occupied}</strong> / {capacity} Beds</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${Math.max(5, pct)}%` }}></div>
                </div>
              </div>

              <div className="hostel-meta-grid">
                <div>
                  <div className="meta-field-label">Floors & Rooms</div>
                  <div className="meta-field-val">4 Floors • 80 Rooms</div>
                </div>
                <div>
                  <div className="meta-field-label">AC / Non-AC Ratio</div>
                  <div className="meta-field-val">40 AC • 40 Non-AC</div>
                </div>
                <div>
                  <div className="meta-field-label">2-Seater / 3-Seater</div>
                  <div className="meta-field-val">40 (2-Seat) • 40 (3-Seat)</div>
                </div>
                <div>
                  <div className="meta-field-label">Total Beds</div>
                  <div className="meta-field-val">200 Beds</div>
                </div>
              </div>

              <div className="hostel-warden-strip">
                <div className="warden-avatar-sm">
                  {hostel.warden_name ? hostel.warden_name.charAt(hostel.warden_name.indexOf('.') + 2 || 0) : 'W'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {hostel.warden_name || 'Assigned Warden'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Resident Warden • {hostel.contact_number}</div>
                </div>
                <ArrowRight size={16} color="var(--primary)" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
