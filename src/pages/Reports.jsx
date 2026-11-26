// pages/Reports.jsx – Reports & Export Module
import React, { useState, useMemo } from 'react';
import {
  FileText, Download, BarChart2, MessageSquare, Cpu,
  Recycle, Calendar, RefreshCw, CheckCircle, FileDown,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { format } from 'date-fns';
import Toast from '../components/shared/Toast';

function getBinStatus(level) {
  if (level >= 85) return 'Critical';
  if (level >= 70) return 'Nearly Full';
  return 'Normal';
}

function Table({ headers, rows, caption }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: 16 }}>
      {caption && <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f3d23', marginBottom: 8 }}>{caption}</div>}
      <table className="eco-table" style={{ fontSize: '0.8125rem' }}>
        <thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={headers.length} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>No data available</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── CSV export ────────────────────────────────────────────────────────────────
function downloadCSV(filename, headers, rows) {
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ── Text report for "print" ───────────────────────────────────────────────────
function printReport(title, content) {
  const w = window.open('', '_blank');
  w.document.write(`
    <html><head><title>${title}</title>
    <style>
      body { font-family: 'Inter', Arial, sans-serif; padding: 40px; max-width: 800px; margin: auto; }
      h1 { color: #0f3d23; border-bottom: 3px solid #22c55e; padding-bottom: 10px; }
      h2 { color: #166534; margin-top: 28px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th { background: #f0fdf4; padding: 8px 12px; text-align: left; border: 1px solid #bbf7d0; font-size: 0.85rem; }
      td { padding: 8px 12px; border: 1px solid #e8f5e9; font-size: 0.85rem; }
      tr:nth-child(even) { background: #f9fef9; }
      .meta { color: #6b7280; font-size: 0.875rem; margin-bottom: 24px; }
      .footer { margin-top: 40px; color: #9ca3af; font-size: 0.78rem; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 16px; }
    </style></head>
    <body>${content}<div class="footer">EcoTrack – Smart Waste Management | Academic Project Report | Generated: ${new Date().toLocaleString('en-IN')}</div></body></html>
  `);
  w.document.close();
  w.print();
}

// ── Report sections ───────────────────────────────────────────────────────────
const REPORTS = [
  {
    id: 'complaints',
    title: 'Complaint Report',
    desc: 'All registered citizen complaints with status and history',
    icon: MessageSquare,
    color: '#16a34a', bg: '#dcfce7',
  },
  {
    id: 'bins',
    title: 'Smart Bin Status Report',
    desc: 'Current fill levels, status, and last collection times for all bins',
    icon: Cpu,
    color: '#3b82f6', bg: '#dbeafe',
  },
  {
    id: 'collection',
    title: 'Waste Collection Report',
    desc: 'Collection schedule status and completion summary',
    icon: Calendar,
    color: '#8b5cf6', bg: '#ede9fe',
  },
  {
    id: 'analytics',
    title: 'Monthly Analytics Report',
    desc: 'Waste generation trends and category-wise breakdown',
    icon: BarChart2,
    color: '#f59e0b', bg: '#ffedd5',
  },
];

export default function Reports() {
  const { state } = useApp();
  const [activeReport, setActiveReport] = useState('complaints');
  const [toast, setToast] = useState(null);

  const genDate = format(new Date(), 'dd MMM yyyy, HH:mm');

  // ── Complaints ──
  const complaintHeaders = ['Complaint ID', 'Citizen', 'Phone', 'Type', 'Location', 'Priority', 'Status', 'Submitted'];
  const complaintRows = state.complaints.map(c => [
    c.id, c.citizenName, c.phone, c.type, c.location, c.priority, c.status,
    format(new Date(c.createdAt), 'dd/MM/yyyy HH:mm'),
  ]);

  // ── Bins ──
  const binHeaders = ['Bin ID', 'Location', 'Zone', 'Type', 'Fill Level', 'Status', 'Sensor', 'Last Updated'];
  const binRows = state.bins.map(b => [
    b.id, b.location, b.zone, b.type, `${b.fillLevel}%`, getBinStatus(b.fillLevel),
    b.sensorType, format(new Date(b.lastUpdated), 'dd/MM/yyyy HH:mm'),
  ]);

  // ── Collection ──
  const collHeaders = ['Schedule ID', 'Bin ID', 'Location', 'Scheduled Date', 'Time', 'Team', 'Status'];
  const collRows = state.collectionSchedule.map(s => [
    s.id, s.binId, s.location, s.scheduledDate, s.scheduledTime, s.assignedTo, s.status,
  ]);

  // ── Analytics ──
  const anaHeaders = ['Metric', 'Value'];
  const anaRows = [
    ['Total Waste Collected', `${state.wasteData.totalCollected.toLocaleString()} kg`],
    ['Organic Waste', `${state.wasteData.organic.toLocaleString()} kg`],
    ['Recyclable Waste', `${state.wasteData.recyclable.toLocaleString()} kg`],
    ['Non-Recyclable Waste', `${state.wasteData.nonRecyclable.toLocaleString()} kg`],
    ['Recycling Rate', `${Math.round((state.wasteData.recyclable / (state.wasteData.totalCollected || 1)) * 100)}%`],
    ...state.wasteData.weeklyCollection.map(d => [`${d.day} (this week)`, `${d.kg} kg`]),
  ];

  const currentReport = REPORTS.find(r => r.id === activeReport);

  const handleCSV = () => {
    const map = {
      complaints: ['complaints_report', complaintHeaders, complaintRows],
      bins: ['bin_status_report', binHeaders, binRows],
      collection: ['collection_schedule_report', collHeaders, collRows],
      analytics: ['analytics_report', anaHeaders, anaRows],
    };
    const [fn, h, r] = map[activeReport];
    downloadCSV(`ecotrack_${fn}_${format(new Date(), 'yyyyMMdd')}.csv`, h, r);
    setToast({ message: 'CSV exported successfully!', type: 'success' });
  };

  const handlePrint = () => {
    const map = {
      complaints: () => `
        <h1>EcoTrack – Complaint Report</h1>
        <p class="meta">Generated: ${genDate} | Total: ${state.complaints.length} complaints</p>
        <h2>Summary</h2>
        <table><tr><th>Status</th><th>Count</th></tr>
          <tr><td>Pending</td><td>${state.complaints.filter(c => c.status === 'Pending').length}</td></tr>
          <tr><td>In Progress</td><td>${state.complaints.filter(c => c.status === 'In Progress').length}</td></tr>
          <tr><td>Resolved</td><td>${state.complaints.filter(c => c.status === 'Resolved').length}</td></tr>
        </table>
        <h2>All Complaints</h2>
        <table><tr>${complaintHeaders.map(h => `<th>${h}</th>`).join('')}</tr>
          ${complaintRows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
        </table>
      `,
      bins: () => `
        <h1>EcoTrack – Smart Bin Status Report</h1>
        <p class="meta">Generated: ${genDate} | Total bins: ${state.bins.length}</p>
        <h2>Summary</h2>
        <table><tr><th>Status</th><th>Count</th></tr>
          <tr><td>Normal (&lt;70%)</td><td>${state.bins.filter(b => b.fillLevel < 70).length}</td></tr>
          <tr><td>Nearly Full (70-84%)</td><td>${state.bins.filter(b => b.fillLevel >= 70 && b.fillLevel < 85).length}</td></tr>
          <tr><td>Critical (≥85%)</td><td>${state.bins.filter(b => b.fillLevel >= 85).length}</td></tr>
        </table>
        <h2>All Bins</h2>
        <table><tr>${binHeaders.map(h => `<th>${h}</th>`).join('')}</tr>
          ${binRows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
        </table>
      `,
      collection: () => `
        <h1>EcoTrack – Collection Schedule Report</h1>
        <p class="meta">Generated: ${genDate}</p>
        <table><tr>${collHeaders.map(h => `<th>${h}</th>`).join('')}</tr>
          ${collRows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
        </table>
      `,
      analytics: () => `
        <h1>EcoTrack – Monthly Analytics Report</h1>
        <p class="meta">Generated: ${genDate}</p>
        <table><tr>${anaHeaders.map(h => `<th>${h}</th>`).join('')}</tr>
          ${anaRows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
        </table>
      `,
    };
    printReport(currentReport.title, map[activeReport]());
    setToast({ message: 'Report opened for printing/PDF export', type: 'info' });
  };

  const tableMap = {
    complaints: { headers: complaintHeaders, rows: complaintRows },
    bins: { headers: binHeaders, rows: binRows },
    collection: { headers: collHeaders, rows: collRows },
    analytics: { headers: anaHeaders, rows: anaRows },
  };

  return (
    <div style={{ padding: 28, maxWidth: 1400 }} className="animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div style={{ marginBottom: 22 }}>
        <h2 className="section-header">Reports & Export</h2>
        <p className="section-sub">Generate, preview, and export EcoTrack operation reports</p>
      </div>

      {/* Report cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
        {REPORTS.map(r => {
          const Icon = r.icon;
          return (
            <button
              key={r.id}
              onClick={() => setActiveReport(r.id)}
              style={{
                background: activeReport === r.id ? 'linear-gradient(135deg, #0f3d23, #166534)' : '#fff',
                border: `2px solid ${activeReport === r.id ? '#22c55e' : '#e8f5e9'}`,
                borderRadius: 14,
                padding: '18px 16px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s',
                boxShadow: activeReport === r.id ? '0 4px 18px rgba(22,163,74,0.25)' : '0 2px 10px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 12, background: activeReport === r.id ? 'rgba(255,255,255,0.15)' : r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Icon size={20} color={activeReport === r.id ? '#fff' : r.color} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: activeReport === r.id ? '#fff' : '#0f3d23', marginBottom: 4 }}>{r.title}</div>
              <div style={{ fontSize: '0.75rem', color: activeReport === r.id ? '#a7f3d0' : '#6b7280' }}>{r.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Report preview */}
      <div className="eco-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: '#0f3d23', margin: 0, fontSize: '1.05rem' }}>
              {currentReport?.title}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#6b7280' }}>Generated: {genDate}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-secondary" onClick={handleCSV}>
              <Download size={15} /> Export CSV
            </button>
            <button className="btn-primary" onClick={handlePrint}>
              <FileDown size={15} /> Print / PDF
            </button>
          </div>
        </div>

        {/* Summary cards */}
        {activeReport === 'complaints' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
            {[
              { l: 'Total', v: state.complaints.length, c: '#16a34a' },
              { l: 'Pending', v: state.complaints.filter(c => c.status === 'Pending').length, c: '#f59e0b' },
              { l: 'In Progress', v: state.complaints.filter(c => c.status === 'In Progress').length, c: '#3b82f6' },
              { l: 'Resolved', v: state.complaints.filter(c => c.status === 'Resolved').length, c: '#22c55e' },
            ].map(s => (
              <div key={s.l} style={{ background: '#f9fef9', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1.4rem', color: s.c, fontFamily: 'Poppins,sans-serif' }}>{s.v}</div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{s.l}</div>
              </div>
            ))}
          </div>
        )}

        {activeReport === 'bins' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
            {[
              { l: 'Total Bins', v: state.bins.length, c: '#3b82f6' },
              { l: 'Normal', v: state.bins.filter(b => b.fillLevel < 70).length, c: '#22c55e' },
              { l: 'Nearly Full', v: state.bins.filter(b => b.fillLevel >= 70 && b.fillLevel < 85).length, c: '#f59e0b' },
              { l: 'Critical', v: state.bins.filter(b => b.fillLevel >= 85).length, c: '#ef4444' },
            ].map(s => (
              <div key={s.l} style={{ background: '#f9fef9', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: '1.4rem', color: s.c, fontFamily: 'Poppins,sans-serif' }}>{s.v}</div>
                <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{s.l}</div>
              </div>
            ))}
          </div>
        )}

        <Table
          headers={tableMap[activeReport].headers}
          rows={tableMap[activeReport].rows}
        />
      </div>
    </div>
  );
}
