import React from 'react';
import { Database, Sun, Moon, Bell, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Navbar({ currentTheme, onToggleTheme, dbStatus, onOpenDbModal }) {
  const isConnected = dbStatus?.isConnected;

  return (
    <header className="top-header">
      <div className="header-left">
        <h1 className="page-title">Hostel Administration Portal</h1>
        <span className="header-tag">Campus Term 2026-2027</span>
      </div>

      <div className="header-right">
        {/* DB Status Pill */}
        <button
          className={`db-status-pill ${isConnected ? 'connected' : 'fallback'}`}
          onClick={onOpenDbModal}
          title="Click to view or edit MySQL connection settings"
        >
          <span className={`status-dot ${isConnected ? 'emerald' : 'amber'}`}></span>
          <Database size={15} />
          <span>{isConnected ? 'MySQL Live' : 'Storage Engine Active'}</span>
        </button>

        {/* Theme Toggle */}
        <button
          className="btn-icon"
          onClick={onToggleTheme}
          title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {currentTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Admin Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-card)'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--gradient-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Shield size={14} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', lineHeight: '1.1' }}>Chief Warden Office</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Super Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}
