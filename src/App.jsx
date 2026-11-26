// App.jsx – Root application with layout and navigation
import React, { useState } from 'react';
import { AppProvider } from './store/AppContext';
import Sidebar from './components/Layout/Sidebar';
import Topbar from './components/Layout/Topbar';
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import SmartBins from './pages/SmartBins';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

const PAGES = {
  dashboard:  Dashboard,
  complaints: Complaints,
  bins:       SmartBins,
  analytics:  Analytics,
  reports:    Reports,
  settings:   Settings,
};

function AppInner() {
  const [page, setPage] = useState('dashboard');
  const PageComponent = PAGES[page] || Dashboard;

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f1f5f1',
      overflow: 'hidden',
    }}>
      <Sidebar active={page} onNavigate={setPage} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Topbar page={page} />
        <main style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          background: '#f4f6f4',
        }}>
          <PageComponent onNavigate={setPage} />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
