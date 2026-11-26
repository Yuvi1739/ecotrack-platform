// components/Layout/Topbar.jsx
import React, { useState } from 'react';
import { Bell, Search, User, RefreshCw, X, CheckCheck } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { formatDistanceToNow } from 'date-fns';

const PAGE_TITLES = {
  dashboard:  { title: 'Dashboard',              sub: 'Overview of EcoTrack operations' },
  complaints: { title: 'Complaint Management',   sub: 'Register & track citizen complaints' },
  bins:       { title: 'Smart Bin Monitoring',   sub: 'Real-time bin status and IoT sensor data' },
  analytics:  { title: 'Waste Analytics',        sub: 'Insights, charts, and route suggestions' },
  reports:    { title: 'Reports',                sub: 'Generate and export operation reports' },
  settings:   { title: 'Settings',               sub: 'Configure EcoTrack preferences' },
};

export default function Topbar({ page }) {
  const { state, dispatch } = useApp();
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = state.notifications.filter(n => !n.read).length;
  const info = PAGE_TITLES[page] || PAGE_TITLES.dashboard;

  const notifColor = { warning: '#f59e0b', success: '#22c55e', info: '#3b82f6', error: '#ef4444' };

  return (
    <header style={{
      height: 68,
      background: '#fff',
      borderBottom: '1px solid #e8f5e9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 30,
      boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
    }}>
      {/* Left: Page title */}
      <div>
        <h1 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '1.15rem', color: '#0f3d23', margin: 0 }}>
          {info.title}
        </h1>
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280' }}>{info.sub}</p>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
        {/* Notification Bell */}
        <button
          onClick={() => setShowNotifs(v => !v)}
          style={{
            position: 'relative', background: '#f0fdf4', border: '1.5px solid #bbf7d0',
            borderRadius: 10, padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center',
            transition: 'all 0.2s',
          }}
        >
          <Bell size={18} color="#16a34a" />
          {unread > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              background: '#ef4444', color: '#fff',
              borderRadius: 99, width: 18, height: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.65rem', fontWeight: 700, border: '2px solid #fff',
            }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {/* Admin badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#f0fdf4', border: '1.5px solid #bbf7d0',
          borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #16a34a, #22c55e)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User size={14} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f3d23', lineHeight: 1 }}>Admin</div>
            <div style={{ fontSize: '0.68rem', color: '#6b7280' }}>BBMP</div>
          </div>
        </div>

        {/* Notification Dropdown */}
        {showNotifs && (
          <div style={{
            position: 'absolute', top: '110%', right: 0,
            width: 380, background: '#fff',
            borderRadius: 16, border: '1.5px solid #e8f5e9',
            boxShadow: '0 16px 48px rgba(0,0,0,0.14)',
            zIndex: 100, overflow: 'hidden', animation: 'fadeIn 0.2s ease',
          }}>
            <div style={{
              padding: '14px 18px', borderBottom: '1px solid #f0fdf4',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ fontWeight: 700, color: '#0f3d23', fontSize: '0.95rem' }}>
                Notifications {unread > 0 && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>({unread} new)</span>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-icon" onClick={() => dispatch({ type: 'MARK_ALL_NOTIFS_READ' })} title="Mark all read">
                  <CheckCheck size={14} />
                </button>
                <button className="btn-icon" onClick={() => setShowNotifs(false)} title="Close">
                  <X size={14} />
                </button>
              </div>
            </div>
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {state.notifications.length === 0 ? (
                <div className="empty-state" style={{ padding: 28 }}>
                  <Bell size={32} />
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>No notifications</p>
                </div>
              ) : (
                state.notifications.slice(0, 20).map(n => (
                  <div
                    key={n.id}
                    onClick={() => dispatch({ type: 'MARK_NOTIF_READ', payload: n.id })}
                    style={{
                      padding: '12px 18px',
                      borderBottom: '1px solid #f9fef9',
                      cursor: 'pointer',
                      background: n.read ? '#fff' : '#f0fdf4',
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      transition: 'background 0.15s',
                    }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: notifColor[n.type] || '#6b7280',
                      marginTop: 6, flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.8125rem', color: '#1a2e1a', lineHeight: 1.45 }}>{n.message}</div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 3 }}>
                        {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                    {!n.read && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0, marginTop: 6 }} />
                    )}
                  </div>
                ))
              )}
            </div>
            <div style={{ padding: '10px 18px', borderTop: '1px solid #f0fdf4', textAlign: 'center' }}>
              <button
                onClick={() => dispatch({ type: 'CLEAR_NOTIFICATIONS' })}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Clear all notifications
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
