import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import CampusOverview from './components/CampusOverview';
import RoomMatrix from './components/RoomMatrix';
import StudentDirectory from './components/StudentDirectory';
import FeeLedger from './components/FeeLedger';
import ComplaintsDesk from './components/ComplaintsDesk';
import GatePassManager from './components/GatePassManager';
import WardenDirectory from './components/WardenDirectory';
import MessPlanner from './components/MessPlanner';
import DbSettingsModal from './components/DbSettingsModal';
import { fetchStats, fetchHostels, getDbStatus } from './services/api';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('aura_theme') || 'dark');
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [dbStatus, setDbStatus] = useState(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [preselectedHostelId, setPreselectedHostelId] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aura_theme', theme);
  }, [theme]);

  useEffect(() => {
    loadAppMetadata();
  }, []);

  const loadAppMetadata = async () => {
    try {
      const [statsRes, hostelsRes, dbRes] = await Promise.all([
        fetchStats(),
        fetchHostels(),
        getDbStatus()
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (hostelsRes.success) setHostels(hostelsRes.data);
      if (dbRes.success) setDbStatus(dbRes.data);
    } catch (err) {
      console.error('Failed to load metadata:', err);
    }
  };

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSelectHostelFromOverview = (hostelId) => {
    setPreselectedHostelId(hostelId);
    setActiveTab('rooms');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onOpenDbModal={() => setIsDbModalOpen(true)}
      />

      {/* Main Wrapper */}
      <div className="main-wrapper">
        <Navbar
          currentTheme={theme}
          onToggleTheme={handleToggleTheme}
          dbStatus={dbStatus}
          onOpenDbModal={() => setIsDbModalOpen(true)}
        />

        <main className="content-body">
          {activeTab === 'overview' && (
            <CampusOverview
              stats={stats}
              hostels={hostels}
              onSelectHostel={handleSelectHostelFromOverview}
            />
          )}

          {activeTab === 'rooms' && (
            <RoomMatrix
              hostels={hostels}
              preselectedHostelId={preselectedHostelId}
            />
          )}

          {activeTab === 'students' && (
            <StudentDirectory
              hostels={hostels}
              onNavigateToRooms={() => setActiveTab('rooms')}
            />
          )}

          {activeTab === 'fees' && <FeeLedger />}

          {activeTab === 'complaints' && <ComplaintsDesk hostels={hostels} />}

          {activeTab === 'gatepasses' && <GatePassManager />}

          {activeTab === 'wardens' && <WardenDirectory />}

          {activeTab === 'mess' && <MessPlanner />}
        </main>
      </div>

      {/* MySQL Connection & Config Modal */}
      <DbSettingsModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        onDbUpdated={loadAppMetadata}
      />
    </div>
  );
}
