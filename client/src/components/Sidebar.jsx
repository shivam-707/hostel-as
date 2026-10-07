import React from 'react';
import {
  Building2,
  BedDouble,
  Users,
  CreditCard,
  Wrench,
  KeyRound,
  ShieldAlert,
  UtensilsCrossed,
  Settings,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, stats, onOpenDbModal }) {
  const navItems = [
    { id: 'overview', label: 'Campus Overview', icon: Building2 },
    { id: 'rooms', label: 'Room & Bed Matrix', icon: BedDouble, badge: '400 Rms' },
    { id: 'students', label: 'Student Admissions', icon: Users, badge: stats?.totalStudents || '8' },
    { id: 'fees', label: 'Fee Ledger', icon: CreditCard },
    { id: 'complaints', label: 'Maintenance Desk', icon: Wrench, badge: stats?.pendingComplaints ? `${stats.pendingComplaints} Open` : null },
    { id: 'gatepasses', label: 'Digital Gate Pass', icon: KeyRound, badge: stats?.activeGatePasses ? `${stats.activeGatePasses} Active` : null },
    { id: 'wardens', label: 'Wardens Directory', icon: ShieldAlert, badge: '6 Wardens' },
    { id: 'mess', label: 'Dining & Mess Menu', icon: UtensilsCrossed },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Building2 size={24} />
        </div>
        <div>
          <div className="brand-title">AuraHostel</div>
          <div className="brand-subtitle">Campus Housing Admin</div>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-label">Main Navigation</div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          );
        })}

        <div className="nav-section-label" style={{ marginTop: '12px' }}>System</div>
        <button className="nav-item" onClick={onOpenDbModal}>
          <Settings size={18} />
          <span>MySQL Config</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <div style={{
          padding: '12px',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.78rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', marginBottom: '4px', color: 'var(--primary)' }}>
            <Sparkles size={14} /> Campus Configuration
          </div>
          <div style={{ color: 'var(--text-secondary)' }}>
            • 4 Boys + 1 Girls Hostel<br />
            • 80 Rooms / Hostel (400 Total)<br />
            • 1,000 Bed Capacity
          </div>
        </div>
      </div>
    </aside>
  );
}
