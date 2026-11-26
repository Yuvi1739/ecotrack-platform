// pages/Complaints.jsx – Module 1: User Reporting & Complaint Management
import React, { useState, useRef, useMemo } from 'react';
import {
  Plus, Search, Filter, Eye, Edit3, Trash2, CheckCircle, Clock,
  Circle, Upload, MapPin, Phone, Mail, User, Calendar, MessageSquare,
  X, ChevronDown, Navigation,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatDistanceToNow, format } from 'date-fns';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import Toast from '../components/shared/Toast';

const TYPES = ['Overflowing Garbage', 'Uncollected Garbage', 'Damaged Dustbin', 'Illegal Waste Dumping'];
const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved'];

function getBadgeClass(status) {
  if (status === 'Resolved') return 'badge-resolved';
  if (status === 'In Progress') return 'badge-progress';
  return 'badge-pending';
}

function getPriorityColor(p) {
  if (p === 'High') return { color: '#ef4444', bg: '#fee2e2' };
  if (p === 'Medium') return { color: '#f59e0b', bg: '#fef9c3' };
  return { color: '#6b7280', bg: '#f3f4f6' };
}

// ── Complaint Form Modal ─────────────────────────────────────────────────────
function ComplaintForm({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    citizenName: '', phone: '', email: '', type: TYPES[0],
    location: '', description: '', priority: 'Medium', photoBase64: null, photoName: null,
  });
  const [errors, setErrors] = useState({});
  const [gpsLoading, setGpsLoading] = useState(false);
  const fileRef = useRef();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.citizenName.trim()) e.citizenName = 'Name is required';
    if (!form.phone.match(/^[6-9]\d{9}$/)) e.phone = 'Enter valid 10-digit mobile number';
    if (form.email && !form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter valid email';
    if (!form.location.trim()) e.location = 'Location is required';
    if (!form.description.trim() || form.description.trim().length < 20) e.description = 'Description must be at least 20 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const getGPS = () => {
    if (!navigator.geolocation) { alert('GPS not supported'); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        set('location', `GPS: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setGpsLoading(false);
      },
      () => { alert('Unable to get location. Please enter manually.'); setGpsLoading(false); }
    );
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File too large. Max 5MB.'); return; }
    const reader = new FileReader();
    reader.onload = ev => { set('photoBase64', ev.target.result); set('photoName', file.name); };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 620 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: '#0f3d23', margin: 0 }}>Submit New Complaint</h2>
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '0.8125rem' }}>Report a garbage issue in your area</p>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label className="eco-label"><User size={12} style={{ display: 'inline', marginRight: 4 }} />Citizen Name *</label>
              <input className="eco-input" value={form.citizenName} onChange={e => set('citizenName', e.target.value)} placeholder="Your full name" />
              {errors.citizenName && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '4px 0 0' }}>{errors.citizenName}</p>}
            </div>
            <div>
              <label className="eco-label"><Phone size={12} style={{ display: 'inline', marginRight: 4 }} />Mobile Number *</label>
              <input className="eco-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="10-digit mobile" maxLength={10} />
              {errors.phone && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '4px 0 0' }}>{errors.phone}</p>}
            </div>
            <div>
              <label className="eco-label"><Mail size={12} style={{ display: 'inline', marginRight: 4 }} />Email Address</label>
              <input className="eco-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Optional" />
              {errors.email && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '4px 0 0' }}>{errors.email}</p>}
            </div>
            <div>
              <label className="eco-label">Complaint Type *</label>
              <select className="eco-input" value={form.type} onChange={e => set('type', e.target.value)}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="eco-label"><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />Location / Address *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="eco-input" value={form.location} onChange={e => set('location', e.target.value)}
                  placeholder="Area, road, or landmark" style={{ flex: 1 }} />
                <button type="button" onClick={getGPS} className="btn-secondary" style={{ padding: '8px 14px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  <Navigation size={14} />{gpsLoading ? 'Getting...' : 'Use GPS'}
                </button>
              </div>
              {errors.location && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '4px 0 0' }}>{errors.location}</p>}
            </div>
            <div>
              <label className="eco-label">Priority</label>
              <select className="eco-input" value={form.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="eco-label"><Upload size={12} style={{ display: 'inline', marginRight: 4 }} />Upload Photo (max 5MB)</label>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
              <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()} style={{ width: '100%', justifyContent: 'center', padding: '9px' }}>
                <Upload size={14} />{form.photoName ? form.photoName.slice(0, 22) + '…' : 'Choose file'}
              </button>
              {form.photoBase64 && <img src={form.photoBase64} alt="preview" style={{ marginTop: 8, width: '100%', height: 80, objectFit: 'cover', borderRadius: 8 }} />}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="eco-label"><MessageSquare size={12} style={{ display: 'inline', marginRight: 4 }} />Description *</label>
              <textarea className="eco-input" rows={3} value={form.description}
                onChange={e => set('description', e.target.value)}
                placeholder="Describe the garbage issue in detail (min. 20 characters)" />
              {errors.description && <p style={{ color: '#ef4444', fontSize: '0.75rem', margin: '4px 0 0' }}>{errors.description}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">
              <CheckCircle size={15} /> Submit Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Detail View Modal ────────────────────────────────────────────────────────
function ComplaintDetail({ complaint, onClose, onUpdateStatus }) {
  const [newStatus, setNewStatus] = useState(complaint.status);
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const p = getPriorityColor(complaint.priority);

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 580 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: '#0f3d23', margin: 0, fontSize: '1.15rem' }}>
                {complaint.id}
              </h2>
              <span className={`badge ${getBadgeClass(complaint.status)}`}>{complaint.status}</span>
              <span style={{ background: p.bg, color: p.color, borderRadius: 99, padding: '2px 10px', fontSize: '0.72rem', fontWeight: 600 }}>
                {complaint.priority}
              </span>
            </div>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8rem' }}>{complaint.type}</p>
          </div>
          <button onClick={onClose} className="btn-icon"><X size={16} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Citizen', value: complaint.citizenName },
            { label: 'Phone', value: complaint.phone },
            { label: 'Email', value: complaint.email || '—' },
            { label: 'Location', value: complaint.location },
            { label: 'Submitted', value: format(new Date(complaint.createdAt), 'dd MMM yyyy, HH:mm') },
            { label: 'Last Updated', value: format(new Date(complaint.updatedAt), 'dd MMM yyyy, HH:mm') },
          ].map(f => (
            <div key={f.label} style={{ background: '#f9fef9', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.label}</div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#1a2e1a', marginTop: 2 }}>{f.value}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#f9fef9', borderRadius: 8, padding: '12px', marginBottom: 16 }}>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Description</div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#374151', lineHeight: 1.6 }}>{complaint.description}</p>
        </div>

        {complaint.photoBase64 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Uploaded Photo</div>
            <img src={complaint.photoBase64} alt="complaint" style={{ width: '100%', borderRadius: 10, maxHeight: 200, objectFit: 'cover' }} />
          </div>
        )}

        {/* Status timeline */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>History</div>
          {complaint.history.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', marginTop: 4 }} />
                {i < complaint.history.length - 1 && <div style={{ width: 2, flex: 1, background: '#d1fae5', marginTop: 3 }} />}
              </div>
              <div style={{ paddingBottom: 8 }}>
                <span className={`badge ${getBadgeClass(h.status)}`} style={{ marginBottom: 3 }}>{h.status}</span>
                <div style={{ fontSize: '0.78rem', color: '#374151', marginTop: 3 }}>{h.note}</div>
                <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{format(new Date(h.timestamp), 'dd MMM yyyy, HH:mm')}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Admin: update status */}
        {complaint.status !== 'Resolved' && (
          <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '14px', border: '1px solid #bbf7d0' }}>
            <div style={{ fontWeight: 600, color: '#166534', fontSize: '0.85rem', marginBottom: 10 }}>Update Status (Admin)</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <select className="eco-input" style={{ flex: 1 }} value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
            </div>
            <input className="eco-input" placeholder="Add a note (optional)" value={note} onChange={e => setNote(e.target.value)} style={{ marginBottom: 10 }} />
            <button className="btn-primary" onClick={() => { onUpdateStatus(complaint.id, newStatus, note); onClose(); }}>
              <Edit3 size={14} /> Update Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Complaints Page ─────────────────────────────────────────────────────
export default function Complaints() {
  const { state, dispatch } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [viewComplaint, setViewComplaint] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [activeTab, setActiveTab] = useState('list');

  const showToast = (message, type = 'success') => setToast({ message, type });

  const filtered = useMemo(() => {
    return state.complaints.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.id.toLowerCase().includes(q) || c.citizenName.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.type.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'All' || c.status === filterStatus;
      const matchType = filterType === 'All' || c.type === filterType;
      return matchSearch && matchStatus && matchType;
    });
  }, [state.complaints, search, filterStatus, filterType]);

  const handleSubmit = (form) => {
    dispatch({ type: 'ADD_COMPLAINT', payload: form });
    setShowForm(false);
    showToast('Complaint submitted successfully! You will receive updates via notification.');
  };

  const handleUpdateStatus = (id, status, note) => {
    dispatch({ type: 'UPDATE_COMPLAINT_STATUS', payload: { id, status, note } });
    showToast(`Complaint ${id} updated to "${status}"`);
  };

  const handleDelete = (id) => {
    dispatch({ type: 'DELETE_COMPLAINT', payload: id });
    setConfirmDelete(null);
    showToast('Complaint deleted', 'error');
  };

  const stats = useMemo(() => ({
    total:      state.complaints.length,
    pending:    state.complaints.filter(c => c.status === 'Pending').length,
    inProgress: state.complaints.filter(c => c.status === 'In Progress').length,
    resolved:   state.complaints.filter(c => c.status === 'Resolved').length,
  }), [state.complaints]);

  return (
    <div style={{ padding: 28, maxWidth: 1400 }} className="animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />
      {showForm && <ComplaintForm onClose={() => setShowForm(false)} onSubmit={handleSubmit} />}
      {viewComplaint && (
        <ComplaintDetail
          complaint={viewComplaint}
          onClose={() => setViewComplaint(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Complaint"
        message={`Are you sure you want to delete complaint ${confirmDelete}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
        <div>
          <h2 className="section-header">Complaint Management</h2>
          <p className="section-sub">Submit, track, and manage citizen garbage complaints</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> New Complaint
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { label: 'Total', value: stats.total, color: '#16a34a', bg: '#dcfce7' },
          { label: 'Pending', value: stats.pending, color: '#d97706', bg: '#ffedd5' },
          { label: 'In Progress', value: stats.inProgress, color: '#2563eb', bg: '#dbeafe' },
          { label: 'Resolved', value: stats.resolved, color: '#22c55e', bg: '#dcfce7' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 14, padding: '16px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: s.color }}>{s.value}</span>
            </div>
            <span style={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="eco-card" style={{ padding: '16px 20px', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: '1', minWidth: 200 }}>
            <Search size={15} color="#9ca3af" />
            <input placeholder="Search by ID, name, location, type…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="eco-input" style={{ width: 160 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="eco-input" style={{ width: 200 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="All">All Types</option>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
            {filtered.length} of {state.complaints.length} complaints
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="eco-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="eco-table">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Citizen</th>
                <th>Type</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <MessageSquare size={36} />
                      <h3 style={{ margin: '12px 0 4px', color: '#6b7280' }}>No complaints found</h3>
                      <p style={{ margin: 0, fontSize: '0.875rem' }}>Try adjusting your search or filters</p>
                      <button className="btn-primary" style={{ marginTop: 14 }} onClick={() => setShowForm(true)}>
                        <Plus size={14} /> Submit First Complaint
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(c => {
                  const p = getPriorityColor(c.priority);
                  return (
                    <tr key={c.id}>
                      <td>
                        <span style={{ fontWeight: 700, color: '#16a34a', fontFamily: 'Poppins,sans-serif' }}>{c.id}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1a2e1a', fontSize: '0.8125rem' }}>{c.citizenName}</div>
                        <div style={{ color: '#9ca3af', fontSize: '0.72rem' }}>{c.phone}</div>
                      </td>
                      <td style={{ fontSize: '0.8125rem' }}>{c.type}</td>
                      <td style={{ fontSize: '0.8125rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span title={c.location}>{c.location}</span>
                      </td>
                      <td>
                        <span style={{ background: p.bg, color: p.color, borderRadius: 99, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 600 }}>
                          {c.priority}
                        </span>
                      </td>
                      <td><span className={`badge ${getBadgeClass(c.status)}`}>{c.status}</span></td>
                      <td style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                        {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn-icon" onClick={() => setViewComplaint(c)} title="View Details">
                            <Eye size={14} />
                          </button>
                          {c.status !== 'Resolved' && (
                            <button className="btn-icon" onClick={() => {
                              const next = c.status === 'Pending' ? 'In Progress' : 'Resolved';
                              handleUpdateStatus(c.id, next, '');
                            }} title={`Move to ${c.status === 'Pending' ? 'In Progress' : 'Resolved'}`}
                              style={{ background: '#dcfce7', borderColor: '#86efac' }}>
                              <CheckCircle size={14} color="#16a34a" />
                            </button>
                          )}
                          <button className="btn-icon" onClick={() => setConfirmDelete(c.id)} title="Delete"
                            style={{ background: '#fee2e2', borderColor: '#fca5a5' }}>
                            <Trash2 size={14} color="#ef4444" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
