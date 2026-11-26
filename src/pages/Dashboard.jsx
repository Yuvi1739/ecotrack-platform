// pages/Dashboard.jsx – Main overview dashboard
import React, { useMemo } from 'react';
import {
  MessageSquare, Clock, Cpu, AlertOctagon, Weight, Recycle,
  TrendingUp, ArrowRight, AlertTriangle, CheckCircle, Circle, Zap,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatDistanceToNow } from 'date-fns';

function StatCard({ icon: Icon, label, value, sub, color, bgColor }) {
  return (
    <div className="stat-card animate-fade-in">
      <div className="stat-icon" style={{ background: bgColor }}>
        <Icon size={24} color={color} strokeWidth={2.2} />
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f3d23', fontFamily: 'Poppins,sans-serif', lineHeight: 1 }}>
          {value}
        </div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginTop: 4 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function getBinStatus(level) {
  if (level >= 85) return { label: 'Full/Critical', cls: 'badge-critical', color: '#ef4444' };
  if (level >= 70) return { label: 'Nearly Full', cls: 'badge-warning', color: '#f59e0b' };
  return { label: 'Normal', cls: 'badge-normal', color: '#22c55e' };
}

function getComplaintBadgeClass(status) {
  if (status === 'Resolved') return 'badge-resolved';
  if (status === 'In Progress') return 'badge-progress';
  return 'badge-pending';
}

export default function Dashboard({ onNavigate }) {
  const { state } = useApp();
  const { complaints, bins, notifications, wasteData } = state;

  const stats = useMemo(() => ({
    total:     complaints.length,
    pending:   complaints.filter(c => c.status === 'Pending').length,
    inProgress:complaints.filter(c => c.status === 'In Progress').length,
    resolved:  complaints.filter(c => c.status === 'Resolved').length,
    totalBins: bins.length,
    fullBins:  bins.filter(b => b.fillLevel >= 85).length,
    nearlyFull:bins.filter(b => b.fillLevel >= 70 && b.fillLevel < 85).length,
    wasted:    wasteData.totalCollected,
    recycled:  wasteData.recyclable,
  }), [complaints, bins, wasteData]);

  const recentComplaints = complaints.slice(0, 5);
  const criticalBins = bins.filter(b => b.fillLevel >= 85).sort((a, b) => b.fillLevel - a.fillLevel);
  const recentNotifs = notifications.filter(n => !n.read).slice(0, 4);

  const notifColor = { warning: '#f59e0b', success: '#22c55e', info: '#3b82f6', error: '#ef4444' };

  return (
    <div style={{ padding: 28, maxWidth: 1400 }} className="animate-fade-in">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f3d23 0%, #166534 50%, #16a34a 100%)',
        borderRadius: 20,
        padding: '28px 32px',
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#fff',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', right: 60, bottom: -60, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '1.5rem', marginBottom: 6 }}>
            🌿 Welcome to EcoTrack Dashboard
          </div>
          <div style={{ fontSize: '0.875rem', color: '#a7f3d0', maxWidth: 560 }}>
            Smart Waste Management using Mobile Monitoring and Waste Analytics — {state.settings.city}, {state.settings.orgName}
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '4px 12px', fontSize: '0.78rem', color: '#d1fae5' }}>
              📅 {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            {stats.fullBins > 0 && (
              <span style={{ background: 'rgba(239,68,68,0.25)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, padding: '4px 12px', fontSize: '0.78rem', color: '#fca5a5' }}>
                ⚠️ {stats.fullBins} bin{stats.fullBins > 1 ? 's' : ''} need immediate collection
              </span>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right', position: 'relative' }}>
          <div style={{ fontSize: '3rem', lineHeight: 1 }}>♻️</div>
          <div style={{ fontSize: '0.75rem', color: '#6ee7b7', marginTop: 4 }}>IoT-Powered</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-stats" style={{ marginBottom: 24 }}>
        <StatCard icon={MessageSquare} label="Total Complaints" value={stats.total}
          sub={`${stats.inProgress} in progress`} color="#16a34a" bgColor="#dcfce7" />
        <StatCard icon={Clock} label="Pending Complaints" value={stats.pending}
          sub="Awaiting action" color="#d97706" bgColor="#ffedd5" />
        <StatCard icon={Cpu} label="Total Smart Bins" value={stats.totalBins}
          sub={`${stats.nearlyFull} nearly full`} color="#3b82f6" bgColor="#dbeafe" />
        <StatCard icon={AlertOctagon} label="Full / Critical Bins" value={stats.fullBins}
          sub="Require immediate collection" color="#ef4444" bgColor="#fee2e2" />
        <StatCard icon={Weight} label="Waste Collected" value={`${stats.wasted.toLocaleString()} kg`}
          sub="Total across all zones" color="#8b5cf6" bgColor="#ede9fe" />
        <StatCard icon={Recycle} label="Recyclable Waste" value={`${stats.recycled.toLocaleString()} kg`}
          sub={`${Math.round((stats.recycled / stats.wasted) * 100) || 0}% of total`} color="#0ea5e9" bgColor="#e0f2fe" />
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Recent Complaints */}
        <div className="eco-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="section-header" style={{ fontSize: '1rem', margin: 0 }}>Recent Complaints</h3>
            <button onClick={() => onNavigate('complaints')} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
              View All <ArrowRight size={13} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {recentComplaints.map((c, i) => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 0',
                borderBottom: i < recentComplaints.length - 1 ? '1px solid #f0fdf4' : 'none',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: c.status === 'Resolved' ? '#dcfce7' : c.status === 'In Progress' ? '#dbeafe' : '#ffedd5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {c.status === 'Resolved'
                    ? <CheckCircle size={16} color="#22c55e" />
                    : c.status === 'In Progress'
                    ? <Circle size={16} color="#3b82f6" />
                    : <Clock size={16} color="#f59e0b" />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1a2e1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.id} – {c.type}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{c.citizenName} · {c.location}</div>
                </div>
                <span className={`badge ${getComplaintBadgeClass(c.status)}`}>{c.status}</span>
              </div>
            ))}
            {recentComplaints.length === 0 && (
              <div className="empty-state" style={{ padding: 24 }}>
                <MessageSquare size={28} />
                <p style={{ margin: '8px 0 0', fontSize: '0.875rem' }}>No complaints yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Critical Bins */}
        <div className="eco-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="section-header" style={{ fontSize: '1rem', margin: 0 }}>🔴 Critical Bins</h3>
            <button onClick={() => onNavigate('bins')} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
              Monitor <ArrowRight size={13} />
            </button>
          </div>
          {criticalBins.length === 0 ? (
            <div className="empty-state" style={{ padding: 24 }}>
              <CheckCircle size={28} color="#22c55e" />
              <p style={{ margin: '8px 0 0', fontSize: '0.875rem', color: '#22c55e' }}>All bins are within safe levels!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {criticalBins.slice(0, 5).map(b => (
                <div key={b.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px',
                  background: b.fillLevel >= 100 ? '#fff1f2' : '#fff7ed',
                  borderRadius: 10,
                  border: `1px solid ${b.fillLevel >= 100 ? '#fecaca' : '#fed7aa'}`,
                }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                    background: b.fillLevel >= 100 ? '#ef4444' : '#f59e0b',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1a2e1a' }}>{b.id}</div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.location}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontWeight: 800, fontSize: '1.1rem',
                      color: b.fillLevel >= 100 ? '#ef4444' : '#f59e0b',
                      fontFamily: 'Poppins,sans-serif',
                    }}>{b.fillLevel}%</div>
                    <div style={{ fontSize: '0.68rem', color: '#9ca3af' }}>
                      {formatDistanceToNow(new Date(b.lastUpdated), { addSuffix: true })}
                    </div>
                  </div>
                  <div style={{ width: 56 }}>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-fill" style={{
                        width: `${b.fillLevel}%`,
                        background: b.fillLevel >= 100 ? '#ef4444' : '#f59e0b',
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
        {/* Live Alerts */}
        <div className="eco-card" style={{ padding: 22 }}>
          <h3 className="section-header" style={{ fontSize: '1rem', marginBottom: 14 }}>🔔 Live Alerts</h3>
          {recentNotifs.length === 0 ? (
            <div className="empty-state" style={{ padding: 16 }}>
              <CheckCircle size={24} color="#22c55e" />
              <p style={{ margin: '8px 0 0', fontSize: '0.8125rem', color: '#22c55e' }}>No new alerts</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentNotifs.map(n => (
                <div key={n.id} className={`alert-banner ${n.type === 'warning' ? 'warning' : n.type === 'success' ? 'success' : 'info'}`}>
                  <div style={{ flex: 1, fontSize: '0.78rem' }}>{n.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Complaint Summary */}
        <div className="eco-card" style={{ padding: 22 }}>
          <h3 className="section-header" style={{ fontSize: '1rem', marginBottom: 16 }}>Complaint Summary</h3>
          {[
            { label: 'Pending',    val: stats.pending,    color: '#f59e0b', bg: '#ffedd5' },
            { label: 'In Progress',val: stats.inProgress, color: '#3b82f6', bg: '#dbeafe' },
            { label: 'Resolved',   val: stats.resolved,   color: '#22c55e', bg: '#dcfce7' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: '0.8125rem', color: '#374151' }}>{item.label}</span>
              <span style={{
                background: item.bg, color: item.color, borderRadius: 99,
                padding: '2px 10px', fontWeight: 700, fontSize: '0.8rem',
              }}>{item.val}</span>
              <div style={{ width: 80 }}>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{
                    width: `${stats.total > 0 ? (item.val / stats.total) * 100 : 0}%`,
                    background: item.color,
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="eco-card" style={{ padding: 22 }}>
          <h3 className="section-header" style={{ fontSize: '1rem', marginBottom: 14 }}>⚡ Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {[
              { label: 'Submit New Complaint', page: 'complaints', icon: '📝', color: '#dcfce7', textColor: '#15803d' },
              { label: 'Monitor Smart Bins',   page: 'bins',       icon: '🗑️', color: '#dbeafe', textColor: '#1d4ed8' },
              { label: 'View Analytics',       page: 'analytics',  icon: '📊', color: '#ede9fe', textColor: '#7c3aed' },
              { label: 'Generate Report',      page: 'reports',    icon: '📄', color: '#ffedd5', textColor: '#c2410c' },
            ].map(a => (
              <button
                key={a.page}
                onClick={() => onNavigate(a.page)}
                style={{
                  background: a.color, border: 'none', borderRadius: 10,
                  padding: '10px 14px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  textAlign: 'left', transition: 'all 0.2s', width: '100%',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateX(3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
              >
                <span style={{ fontSize: '1.1rem' }}>{a.icon}</span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: a.textColor }}>{a.label}</span>
                <ArrowRight size={13} color={a.textColor} style={{ marginLeft: 'auto' }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
