// components/Layout/Sidebar.jsx
import React from 'react';
import {
  LayoutDashboard, AlertTriangle, Cpu, BarChart3, FileText,
  Settings, Recycle, Bell, ChevronRight
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',          icon: LayoutDashboard },
  { id: 'complaints',  label: 'Complaints',          icon: AlertTriangle },
  { id: 'bins',        label: 'Smart Bin Monitoring',icon: Cpu },
  { id: 'analytics',   label: 'Waste Analytics',     icon: BarChart3 },
  { id: 'reports',     label: 'Reports',             icon: FileText },
  { id: 'settings',    label: 'Settings',            icon: Settings },
];

export default function Sidebar({ active, onNavigate }) {
  const { state } = useApp();
  const unread = state.notifications.filter(n => !n.read).length;

  return (
    <aside className="sidebar" style={{ minWidth: 260 }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42,
            background: 'linear-gradient(135deg, #22c55e, #4ade80)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(34,197,94,0.4)',
            flexShrink: 0,
          }}>
            <Recycle size={22} color="#0a2e18" strokeWidth={2.5} />
          </div>
          <div className="logo-text">
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: '#fff', lineHeight: 1.1 }}>
              EcoTrack
            </div>
            <div style={{ fontSize: '0.7rem', color: '#86efac', fontWeight: 500, marginTop: 1 }}>
              Smart Waste Management
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        <div style={{ padding: '6px 16px 4px', fontSize: '0.65rem', color: '#6ee7b7', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Main Menu
        </div>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
              style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer' }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              <span className="sidebar-label" style={{ flex: 1 }}>{item.label}</span>
              {item.id === 'bins' && unread > 0 && (
                <span style={{
                  background: '#ef4444', color: '#fff',
                  borderRadius: 99, padding: '1px 7px',
                  fontSize: '0.7rem', fontWeight: 700,
                }}>
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        fontSize: '0.72rem',
        color: '#6ee7b7',
      }}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>{state.settings.orgName}</div>
        <div style={{ color: '#4ade80', marginBottom: 2 }}>{state.settings.city} Municipal Corp</div>
        <div style={{ color: 'rgba(255,255,255,0.4)' }}>v1.0.0 – Academic Demo</div>
      </div>
    </aside>
  );
}
