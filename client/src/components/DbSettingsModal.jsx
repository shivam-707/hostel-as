import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertTriangle, RefreshCw, X, Server, Key, User } from 'lucide-react';
import { getDbStatus, testDbConnection } from '../services/api';

export default function DbSettingsModal({ isOpen, onClose, onDbUpdated }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const [formData, setFormData] = useState({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'hostel_db'
  });

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await getDbStatus();
      if (res.success) {
        setStatus(res.data);
        if (res.data.config) {
          setFormData(prev => ({
            ...prev,
            host: res.data.config.host || '127.0.0.1',
            port: res.data.config.port || 3306,
            user: res.data.config.user || 'root',
            database: res.data.config.database || 'hostel_db'
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnect = async (e) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testDbConnection(formData);
      setTestResult(res);
      if (res.status) {
        setStatus(res.status);
      }
      if (res.success && onDbUpdated) {
        onDbUpdated();
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={24} color="#6366f1" />
            <h2 className="modal-title">MySQL Database Configuration</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Current Live State */}
        <div style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: status?.isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          border: `1px solid ${status?.isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
              {status?.isConnected ? (
                <>
                  <CheckCircle size={18} color="#10b981" />
                  <span style={{ color: '#10b981' }}>Live MySQL Connection Active</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={18} color="#f59e0b" />
                  <span style={{ color: '#f59e0b' }}>Local Campus Storage Active (MySQL Ready)</span>
                </>
              )}
            </div>
            <button className="btn-sm btn-secondary" onClick={loadStatus} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={12} className={loading ? 'spin' : ''} /> Refresh
            </button>
          </div>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            {status?.isConnected
              ? `Connected to MySQL database "${status?.config?.database}" at ${status?.config?.host}:${status?.config?.port}. Tables and relations synchronized.`
              : `The system is running smoothly with persistent campus storage. Once you enter your MySQL root password below and connect, tables will automatically initialize in MySQL.`}
          </p>
          {status?.error && (
            <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#fb7185', fontFamily: 'monospace' }}>
              MySQL Note: {status.error}
            </div>
          )}
        </div>

        <form onSubmit={handleTestConnect}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">DB Host</label>
              <input
                className="form-input"
                type="text"
                value={formData.host}
                onChange={e => setFormData({ ...formData, host: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">DB Port</label>
              <input
                className="form-input"
                type="number"
                value={formData.port}
                onChange={e => setFormData({ ...formData, port: parseInt(e.target.value, 10) })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">DB User</label>
              <input
                className="form-input"
                type="text"
                value={formData.user}
                onChange={e => setFormData({ ...formData, user: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">DB Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Enter MySQL root password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Database Name</label>
            <input
              className="form-input"
              type="text"
              value={formData.database}
              onChange={e => setFormData({ ...formData, database: e.target.value })}
              required
            />
          </div>

          {testResult && (
            <div style={{
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              fontSize: '0.86rem',
              fontWeight: '600',
              background: testResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              color: testResult.success ? '#34d399' : '#fb7185',
              border: `1px solid ${testResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
            }}>
              {testResult.success ? '✓ Successfully connected & synchronized MySQL!' : `✕ Connection failed: ${testResult.message}`}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button type="submit" className="btn btn-primary" disabled={testing}>
              {testing ? 'Testing Connection...' : 'Connect to MySQL'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
