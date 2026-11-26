// pages/SmartBins.jsx – Module 2: Smart Bin Monitoring & Notifications
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Cpu, Zap, CheckCircle, AlertTriangle, AlertOctagon, RefreshCw,
  Play, Pause, Plus, Trash2, Edit3, Eye, MapPin, Clock, X,
  Settings, BarChart2, Calendar, Navigation,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatDistanceToNow, format } from 'date-fns';
import Toast from '../components/shared/Toast';
import ConfirmDialog from '../components/shared/ConfirmDialog';

function getBinStatus(level) {
  if (level >= 100) return { label: 'Overflowing', cls: 'badge-critical', color: '#ef4444', bg: '#fee2e2', icon: '🔴' };
  if (level >= 85)  return { label: 'Critical',    cls: 'badge-critical', color: '#ef4444', bg: '#fee2e2', icon: '🔴' };
  if (level >= 70)  return { label: 'Nearly Full', cls: 'badge-warning',  color: '#f59e0b', bg: '#ffedd5', icon: '🟡' };
  return              { label: 'Normal',       cls: 'badge-normal',   color: '#22c55e', bg: '#dcfce7', icon: '🟢' };
}

function FillBar({ level }) {
  const s = getBinStatus(level);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>Fill Level</span>
        <span style={{ fontWeight: 800, fontSize: '1rem', color: s.color, fontFamily: 'Poppins,sans-serif' }}>{level}%</span>
      </div>
      <div className="progress-bar-wrap" style={{ height: 10 }}>
        <div className="progress-bar-fill" style={{
          width: `${level}%`,
          background: level >= 85 ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                    : level >= 70 ? '#f59e0b'
                    : 'linear-gradient(90deg, #22c55e, #4ade80)',
        }} />
      </div>
    </div>
  );
}

// ── Bin Card ─────────────────────────────────────────────────────────────────
function BinCard({ bin, onCollect, onSimulate, onView }) {
  const s = getBinStatus(bin.fillLevel);
  const [sliderVal, setSliderVal] = useState(bin.fillLevel);
  const [showSlider, setShowSlider] = useState(false);

  useEffect(() => { setSliderVal(bin.fillLevel); }, [bin.fillLevel]);

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      padding: 20,
      boxShadow: bin.fillLevel >= 85
        ? `0 4px 20px ${s.color}30, 0 2px 8px rgba(0,0,0,0.06)`
        : '0 2px 12px rgba(0,0,0,0.06)',
      border: `1.5px solid ${bin.fillLevel >= 85 ? s.color + '40' : '#e8f5e9'}`,
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {bin.fillLevel >= 85 && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg, ${s.color}, transparent)`,
          animation: 'shimmer 2s infinite',
        }} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          {/* Bin visual */}
          <div className="bin-visual">
            <div className="bin-fill" style={{
              height: `${bin.fillLevel}%`,
              background: bin.fillLevel >= 85
                ? 'linear-gradient(0deg, #ef4444, #f87171)'
                : bin.fillLevel >= 70
                ? 'linear-gradient(0deg, #f59e0b, #fbbf24)'
                : 'linear-gradient(0deg, #22c55e, #4ade80)',
            }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#0f3d23', fontSize: '1rem', fontFamily: 'Poppins,sans-serif' }}>{bin.id}</div>
            <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 2, maxWidth: 160 }}>{bin.location}</div>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 2 }}>Zone: {bin.zone} · {bin.type}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className={`badge ${s.cls}`} style={{ marginBottom: 6, display: 'block' }}>{s.icon} {s.label}</span>
          {bin.simulated && (
            <span style={{ fontSize: '0.68rem', color: '#8b5cf6', background: '#ede9fe', padding: '1px 7px', borderRadius: 99 }}>SIM</span>
          )}
        </div>
      </div>

      <FillBar level={bin.fillLevel} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
        <div style={{ background: '#f9fef9', borderRadius: 8, padding: '7px 10px' }}>
          <div style={{ fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sensor</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1a2e1a', marginTop: 2 }}>{bin.sensorType}</div>
        </div>
        <div style={{ background: '#f9fef9', borderRadius: 8, padding: '7px 10px' }}>
          <div style={{ fontSize: '0.68rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Updated</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1a2e1a', marginTop: 2 }}>
            {formatDistanceToNow(new Date(bin.lastUpdated), { addSuffix: true })}
          </div>
        </div>
      </div>

      {/* Sensor simulator */}
      <div style={{ marginTop: 12 }}>
        <button
          onClick={() => setShowSlider(v => !v)}
          style={{ fontSize: '0.72rem', color: '#8b5cf6', background: '#ede9fe', border: 'none', padding: '3px 10px', borderRadius: 99, cursor: 'pointer', marginBottom: 8, fontWeight: 600 }}
        >
          {showSlider ? 'Hide' : 'Simulate'} Sensor
        </button>
        {showSlider && (
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="range" min={0} max={100} value={sliderVal}
                onChange={e => setSliderVal(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#22c55e' }} />
              <span style={{ fontWeight: 700, color: '#16a34a', minWidth: 40, textAlign: 'right' }}>{sliderVal}%</span>
            </div>
            <button className="btn-primary" style={{ marginTop: 6, padding: '6px 14px', fontSize: '0.78rem', width: '100%', justifyContent: 'center' }}
              onClick={() => onSimulate(bin.id, sliderVal)}>
              Apply Sensor Value
            </button>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn-icon" onClick={() => onView(bin)} title="Details" style={{ flex: 1, justifyContent: 'center' }}>
          <Eye size={14} /> <span style={{ fontSize: '0.72rem' }}>Details</span>
        </button>
        <button className="btn-primary" onClick={() => onCollect(bin.id)}
          style={{ flex: 1, justifyContent: 'center', padding: '7px 10px', fontSize: '0.78rem',
            background: bin.fillLevel === 0 ? '#9ca3af' : undefined }}
          disabled={bin.fillLevel === 0}
          title="Mark as Collected – resets fill level">
          <CheckCircle size={14} /> Collected
        </button>
      </div>
    </div>
  );
}

// ── Bin Detail Modal ──────────────────────────────────────────────────────────
function BinDetail({ bin, onClose }) {
  const s = getBinStatus(bin.fillLevel);
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 500 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: '#0f3d23', margin: 0 }}>{bin.id} – Details</h2>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>
        <div style={{ marginBottom: 16 }}>
          <FillBar level={bin.fillLevel} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { l: 'Location', v: bin.location },
            { l: 'Zone', v: bin.zone },
            { l: 'Bin Type', v: bin.type },
            { l: 'Capacity', v: `${bin.capacity} L` },
            { l: 'Controller', v: bin.controller },
            { l: 'Sensor', v: bin.sensorType },
            { l: 'Status', v: s.label },
            { l: 'Simulated', v: bin.simulated ? 'Yes' : 'No' },
            { l: 'Last Updated', v: format(new Date(bin.lastUpdated), 'dd MMM yyyy, HH:mm') },
            { l: 'Last Collected', v: bin.lastCollected ? format(new Date(bin.lastCollected), 'dd MMM yyyy') : 'Unknown' },
          ].map(f => (
            <div key={f.l} style={{ background: '#f9fef9', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.l}</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1a2e1a', marginTop: 2 }}>{f.v}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: '12px 14px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: 4 }}>🔌 IoT Architecture Note</div>
          <div style={{ fontSize: '0.78rem', color: '#374151', lineHeight: 1.6 }}>
            This bin is designed for real-time fill monitoring via <strong>ESP32 + Ultrasonic HC-SR04 sensor</strong>.
            Data is ready to be transmitted via <strong>MQTT/Firebase</strong>. Currently showing {bin.simulated ? '🔵 simulated' : '⚫ placeholder'} values.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Schedule Tab ──────────────────────────────────────────────────────────────
function ScheduleTab() {
  const { state, dispatch } = useApp();
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  const updateStatus = (id, status) => {
    dispatch({ type: 'UPDATE_COLLECTION_STATUS', payload: { scheduleId: id, status } });
    showToast(`Collection ${id} marked as ${status}`);
  };

  return (
    <div>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div className="eco-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="eco-table">
            <thead>
              <tr>
                <th>Schedule ID</th>
                <th>Bin</th>
                <th>Location</th>
                <th>Date & Time</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {state.collectionSchedule.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700, color: '#16a34a' }}>{s.id}</td>
                  <td style={{ fontWeight: 600 }}>{s.binId}</td>
                  <td>{s.location}</td>
                  <td>{s.scheduledDate} {s.scheduledTime}</td>
                  <td>{s.assignedTo}</td>
                  <td>
                    <span className={`badge ${s.status === 'Collected' ? 'badge-resolved' : s.status === 'In Transit' ? 'badge-progress' : 'badge-pending'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {s.status === 'Scheduled' && (
                        <button className="btn-warning" style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                          onClick={() => updateStatus(s.id, 'In Transit')}>
                          Start
                        </button>
                      )}
                      {s.status === 'In Transit' && (
                        <button className="btn-primary" style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                          onClick={() => { updateStatus(s.id, 'Collected'); dispatch({ type: 'MARK_BIN_COLLECTED', payload: { binId: s.binId } }); }}>
                          Mark Collected
                        </button>
                      )}
                      {s.status === 'Collected' && (
                        <span style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 600 }}>✅ Done</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main Smart Bins Page ──────────────────────────────────────────────────────
export default function SmartBins() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('bins');
  const [toast, setToast] = useState(null);
  const [viewBin, setViewBin] = useState(null);
  const [filterZone, setFilterZone] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [confirmCollect, setConfirmCollect] = useState(null);
  const [autoSim, setAutoSim] = useState(false);
  const simRef = useRef(null);

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  const zones = ['All', ...new Set(state.bins.map(b => b.zone))];

  const filtered = useMemo(() => {
    return state.bins.filter(b => {
      const matchZone = filterZone === 'All' || b.zone === filterZone;
      const s = getBinStatus(b.fillLevel).label;
      const matchStatus = filterStatus === 'All' || s === filterStatus || (filterStatus === 'Critical' && b.fillLevel >= 85);
      return matchZone && matchStatus;
    });
  }, [state.bins, filterZone, filterStatus]);

  const stats = useMemo(() => ({
    total: state.bins.length,
    normal: state.bins.filter(b => b.fillLevel < 70).length,
    nearly: state.bins.filter(b => b.fillLevel >= 70 && b.fillLevel < 85).length,
    critical: state.bins.filter(b => b.fillLevel >= 85).length,
    avg: Math.round(state.bins.reduce((a, b) => a + b.fillLevel, 0) / state.bins.length),
  }), [state.bins]);

  const handleCollect = (binId) => {
    dispatch({ type: 'MARK_BIN_COLLECTED', payload: { binId } });
    setConfirmCollect(null);
    showToast(`Bin ${binId} marked as collected. Fill level reset to 0%.`);
  };

  const handleSimulate = (binId, level) => {
    dispatch({ type: 'UPDATE_BIN_LEVEL', payload: { binId, level } });
    showToast(`Bin ${binId} sensor value updated to ${level}%`, level >= 85 ? 'warning' : 'success');
  };

  // Auto simulation
  useEffect(() => {
    if (autoSim) {
      simRef.current = setInterval(() => {
        dispatch({ type: 'SIMULATE_ALL_BINS' });
      }, 5000);
      showToast('Auto-simulation started. Bins updating every 5 seconds.', 'info');
    } else {
      if (simRef.current) {
        clearInterval(simRef.current);
        simRef.current = null;
      }
    }
    return () => { if (simRef.current) clearInterval(simRef.current); };
  }, [autoSim, dispatch]);

  return (
    <div style={{ padding: 28, maxWidth: 1400 }} className="animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />
      {viewBin && <BinDetail bin={viewBin} onClose={() => setViewBin(null)} />}
      <ConfirmDialog
        open={!!confirmCollect}
        title="Confirm Collection"
        message={`Mark ${confirmCollect} as collected? This will reset its fill level to 0%.`}
        confirmLabel="Mark Collected"
        type="warning"
        onConfirm={() => handleCollect(confirmCollect)}
        onCancel={() => setConfirmCollect(null)}
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h2 className="section-header">Smart Bin Monitoring</h2>
          <p className="section-sub">Real-time IoT bin monitoring with ESP32 + Ultrasonic sensor support</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className={autoSim ? 'btn-danger' : 'btn-secondary'}
            onClick={() => setAutoSim(v => !v)}
          >
            {autoSim ? <><Pause size={15} /> Stop Auto-Sim</> : <><Play size={15} /> Auto-Simulate</>}
          </button>
          <button className="btn-primary" onClick={() => { dispatch({ type: 'SIMULATE_ALL_BINS' }); showToast('All bin levels updated (simulated)', 'info'); }}>
            <RefreshCw size={15} /> Refresh All
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Total Bins',    value: stats.total,    color: '#3b82f6', bg: '#dbeafe' },
          { label: 'Normal',        value: stats.normal,   color: '#22c55e', bg: '#dcfce7' },
          { label: 'Nearly Full',   value: stats.nearly,   color: '#f59e0b', bg: '#ffedd5' },
          { label: 'Critical/Full', value: stats.critical, color: '#ef4444', bg: '#fee2e2' },
          { label: 'Avg Fill Level',value: `${stats.avg}%`, color: '#8b5cf6', bg: '#ede9fe' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, fontFamily: 'Poppins,sans-serif' }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Auto-sim banner */}
      {autoSim && (
        <div className="alert-banner info" style={{ marginBottom: 16 }}>
          <RefreshCw size={16} className="spin-slow" />
          <span>🤖 <strong>Sensor Simulation Active</strong> – Bin fill levels are being updated every 5 seconds to simulate IoT sensor readings. Values marked with "SIM" badge. Stop simulation to enter manual values.</span>
        </div>
      )}

      {/* IoT Architecture note */}
      <div className="alert-banner success" style={{ marginBottom: 16 }}>
        <Cpu size={16} />
        <span>🔌 <strong>IoT-Ready Architecture</strong> – This system supports <strong>ESP32 microcontrollers + HC-SR04 ultrasonic sensors</strong>. Real hardware integration can be enabled via MQTT broker or Firebase Realtime Database. Current values are demonstration/simulation data.</span>
      </div>

      {/* Tabs */}
      <div className="tab-nav" style={{ marginBottom: 18 }}>
        <button className={`tab-btn ${activeTab === 'bins' ? 'active' : ''}`} onClick={() => setActiveTab('bins')}>
          <Cpu size={14} style={{ display: 'inline', marginRight: 5 }} />Bin Status
        </button>
        <button className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
          <Calendar size={14} style={{ display: 'inline', marginRight: 5 }} />Collection Schedule
        </button>
        <button className={`tab-btn ${activeTab === 'notifs' ? 'active' : ''}`} onClick={() => setActiveTab('notifs')}>
          Notifications {state.notifications.filter(n => !n.read).length > 0 && (
            <span style={{ background: '#ef4444', color: '#fff', borderRadius: 99, padding: '0 6px', fontSize: '0.7rem', marginLeft: 5 }}>
              {state.notifications.filter(n => !n.read).length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'bins' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="eco-input" style={{ width: 150 }} value={filterZone} onChange={e => setFilterZone(e.target.value)}>
              {zones.map(z => <option key={z}>{z}</option>)}
            </select>
            <select className="eco-input" style={{ width: 180 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              {['All', 'Normal', 'Nearly Full', 'Critical', 'Overflowing'].map(s => <option key={s}>{s}</option>)}
            </select>
            <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>Showing {filtered.length} of {state.bins.length} bins</span>
          </div>

          <div className="grid-bins">
            {filtered.map(bin => (
              <BinCard
                key={bin.id}
                bin={bin}
                onCollect={(id) => setConfirmCollect(id)}
                onSimulate={handleSimulate}
                onView={setViewBin}
              />
            ))}
          </div>
        </>
      )}

      {activeTab === 'schedule' && <ScheduleTab />}

      {activeTab === 'notifs' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button className="btn-secondary" onClick={() => dispatch({ type: 'MARK_ALL_NOTIFS_READ' })}>
              Mark all as read
            </button>
          </div>
          {state.notifications.length === 0 ? (
            <div className="empty-state eco-card" style={{ padding: 52 }}>
              <CheckCircle size={40} color="#22c55e" />
              <h3 style={{ margin: '12px 0 4px', color: '#374151' }}>No notifications</h3>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {state.notifications.map(n => (
                <div key={n.id} className="eco-card" style={{
                  padding: '14px 18px',
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  opacity: n.read ? 0.7 : 1,
                  borderLeft: `3px solid ${n.type === 'warning' ? '#f59e0b' : n.type === 'success' ? '#22c55e' : '#3b82f6'}`,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', color: '#1a2e1a', fontWeight: n.read ? 400 : 600 }}>{n.message}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 4 }}>
                      {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                    </div>
                  </div>
                  {!n.read && (
                    <button className="btn-icon" style={{ flexShrink: 0 }}
                      onClick={() => dispatch({ type: 'MARK_NOTIF_READ', payload: n.id })}>
                      <CheckCircle size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
