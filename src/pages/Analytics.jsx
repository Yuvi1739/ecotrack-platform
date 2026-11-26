// pages/Analytics.jsx – Module 3: Waste Analytics & Awareness
import React, { useMemo, useState } from 'react';
import {
  BarChart3, PieChart, TrendingUp, Leaf, Recycle, Trash2,
  Route, MapPin, CheckCircle, ArrowUp, Lightbulb, BookOpen,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { useApp } from '../store/AppContext';
import Toast from '../components/shared/Toast';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement, LineElement,
  PointElement, Title, Tooltip, Legend, Filler
);

const CHART_OPTIONS_BASE = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 12 }, padding: 16 } } },
};

function StatTile({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f3d23', fontFamily: 'Poppins,sans-serif', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── Route Suggestions ─────────────────────────────────────────────────────────
function RouteSuggestions() {
  const { state, dispatch } = useApp();
  const [toast, setToast] = useState(null);

  // Priority: sort by fillLevel descending, only bins ≥ 60%
  const priorityBins = useMemo(() => {
    return [...state.bins]
      .filter(b => b.fillLevel >= 60)
      .sort((a, b) => b.fillLevel - a.fillLevel)
      .map((b, i) => ({ ...b, priority: i + 1 }));
  }, [state.bins]);

  const [completed, setCompleted] = useState([]);

  const markDone = (id) => {
    setCompleted(prev => [...prev, id]);
    dispatch({ type: 'MARK_BIN_COLLECTED', payload: { binId: id } });
    setToast({ message: `Bin ${id} marked as collected in route!`, type: 'success' });
  };

  return (
    <div>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div className="alert-banner info" style={{ marginBottom: 16 }}>
        <Route size={16} />
        <span>📍 <strong>Collection Route Priority Logic:</strong> Bins are sorted by fill level (highest first). This is a <strong>priority-based sequence</strong>, not a GPS-optimized route. Bins ≥ 60% fill level are included. Complete stops in sequence for maximum efficiency.</span>
      </div>
      {priorityBins.length === 0 ? (
        <div className="empty-state eco-card" style={{ padding: 40 }}>
          <CheckCircle size={40} color="#22c55e" />
          <h3 style={{ margin: '12px 0 4px', color: '#374151' }}>All bins within safe levels</h3>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>No collection route needed right now</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {priorityBins.map((b, i) => {
            const done = completed.includes(b.id);
            const isCritical = b.fillLevel >= 85;
            return (
              <div key={b.id} style={{
                background: '#fff',
                borderRadius: 14,
                padding: '16px 20px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                display: 'flex', gap: 16, alignItems: 'center',
                border: `1.5px solid ${done ? '#bbf7d0' : isCritical ? '#fca5a5' : '#e8f5e9'}`,
                opacity: done ? 0.6 : 1,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: done ? '#dcfce7' : isCritical ? '#fee2e2' : '#ffedd5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontWeight: 800, fontSize: '1.1rem', color: done ? '#22c55e' : isCritical ? '#ef4444' : '#f59e0b',
                  fontFamily: 'Poppins,sans-serif',
                }}>
                  {done ? '✓' : b.priority}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#0f3d23', fontSize: '0.9rem' }}>{b.id} – {b.location}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 2 }}>Zone {b.zone} · {b.type} · Last collected: {b.lastCollected ? new Date(b.lastCollected).toLocaleDateString() : 'Unknown'}</div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="progress-bar-wrap" style={{ flex: 1 }}>
                      <div className="progress-bar-fill" style={{
                        width: `${b.fillLevel}%`,
                        background: b.fillLevel >= 85 ? '#ef4444' : b.fillLevel >= 70 ? '#f59e0b' : '#22c55e',
                      }} />
                    </div>
                    <span style={{ fontWeight: 800, color: b.fillLevel >= 85 ? '#ef4444' : '#f59e0b', minWidth: 36, fontFamily: 'Poppins,sans-serif' }}>{b.fillLevel}%</span>
                    {isCritical && <span style={{ background: '#fee2e2', color: '#ef4444', borderRadius: 99, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700 }}>URGENT</span>}
                  </div>
                </div>
                <button
                  disabled={done}
                  onClick={() => markDone(b.id)}
                  className={done ? 'btn-secondary' : 'btn-primary'}
                  style={{ flexShrink: 0, padding: '7px 16px', fontSize: '0.78rem' }}>
                  {done ? '✅ Done' : 'Mark Collected'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Awareness Section ─────────────────────────────────────────────────────────
function WasteAwareness() {
  const categories = [
    {
      emoji: '🍃', title: 'Organic Waste', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
      desc: 'Biodegradable waste from kitchen and garden.',
      items: ['Food scraps & leftovers', 'Vegetable & fruit peels', 'Garden waste & leaves', 'Egg shells & tea bags', 'Biodegradable packaging'],
      tips: ['Compost at home using a compost bin', 'Use organic waste for biogas generation', 'Create kitchen garden compost', 'Separate wet and dry waste always'],
    },
    {
      emoji: '♻️', title: 'Recyclable Waste', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
      desc: 'Materials that can be processed and reused.',
      items: ['Paper & cardboard', 'Glass bottles & jars', 'Plastic bottles (PET)', 'Aluminum cans & metals', 'Newspapers & magazines'],
      tips: ['Rinse containers before recycling', 'Flatten cardboard boxes', 'Remove lids from bottles', 'Check local recycling symbols', 'Sell newspapers to kabadiwala'],
    },
    {
      emoji: '🗑️', title: 'Other / Non-Recyclable', color: '#dc2626', bg: '#fff1f2', border: '#fecaca',
      desc: 'Waste that cannot easily be recycled or composted.',
      items: ['Styrofoam packaging', 'Multi-layer plastic pouches', 'Dirty/contaminated plastic', 'Ceramic & pyrex glass', 'Sanitary waste'],
      tips: ['Minimize purchase of single-use plastics', 'Choose reusable bags & containers', 'Look for products with less packaging', 'Dispose in designated waste bins only'],
    },
  ];

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
        {categories.map(cat => (
          <div key={cat.title} style={{
            background: cat.bg, borderRadius: 16, padding: 22,
            border: `1.5px solid ${cat.border}`,
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: '2rem' }}>{cat.emoji}</span>
              <div>
                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: cat.color, margin: 0, fontSize: '1rem' }}>{cat.title}</h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280' }}>{cat.desc}</p>
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: cat.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Examples</div>
              {cat.items.map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8125rem', color: '#374151' }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: `1px solid ${cat.border}`, paddingTop: 14 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: cat.color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>💡 Tips</div>
              {cat.tips.map(tip => (
                <div key={tip} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 6 }}>
                  <span style={{ color: cat.color, marginTop: 1, flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: '0.8rem', color: '#374151' }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Environmental facts */}
      <div style={{ background: 'linear-gradient(135deg, #0f3d23, #166534)', borderRadius: 16, padding: 28, color: '#fff' }}>
        <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 16px', color: '#4ade80' }}>
          🌍 Environmental Awareness Facts
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {[
            { fact: 'India generates ~62 million tonnes of waste annually, with only ~12 million tonnes processed.', emoji: '🇮🇳' },
            { fact: 'Recycling 1 tonne of paper saves 17 trees and 7,000 gallons of water.', emoji: '🌲' },
            { fact: 'A plastic bottle can take up to 450 years to decompose in a landfill.', emoji: '⏳' },
            { fact: 'Composting organic waste reduces methane emissions from landfills significantly.', emoji: '🌱' },
          ].map(f => (
            <div key={f.emoji} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{f.emoji}</span>
              <span style={{ fontSize: '0.8rem', color: '#a7f3d0', lineHeight: 1.55 }}>{f.fact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Analytics Page ───────────────────────────────────────────────────────
export default function Analytics() {
  const { state } = useApp();
  const { wasteData, bins } = state;
  const [activeTab, setActiveTab] = useState('overview');

  const total = wasteData.totalCollected || 1;

  const pieData = {
    labels: ['Organic', 'Recyclable', 'Non-Recyclable'],
    datasets: [{
      data: [wasteData.organic, wasteData.recyclable, wasteData.nonRecyclable],
      backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b'],
      borderColor: ['#fff', '#fff', '#fff'],
      borderWidth: 3,
      hoverOffset: 6,
    }],
  };

  const barData = {
    labels: wasteData.weeklyCollection.map(d => d.day),
    datasets: [{
      label: 'Waste Collected (kg)',
      data: wasteData.weeklyCollection.map(d => d.kg),
      backgroundColor: wasteData.weeklyCollection.map((_, i) => `hsl(${140 + i * 8}, 65%, ${50 + i * 2}%)`),
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const lineData = {
    labels: wasteData.monthlyTrend.map(d => d.month),
    datasets: [{
      label: 'Monthly Waste (kg)',
      data: wasteData.monthlyTrend.map(d => d.kg),
      borderColor: '#16a34a',
      backgroundColor: 'rgba(34,197,94,0.12)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#16a34a',
      pointRadius: 5,
    }],
  };

  const binFillData = {
    labels: bins.map(b => b.id),
    datasets: [{
      label: 'Fill Level (%)',
      data: bins.map(b => b.fillLevel),
      backgroundColor: bins.map(b =>
        b.fillLevel >= 85 ? '#ef4444' : b.fillLevel >= 70 ? '#f59e0b' : '#22c55e'
      ),
      borderRadius: 6,
    }],
  };

  return (
    <div style={{ padding: 28, maxWidth: 1400 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h2 className="section-header">Waste Analytics & Awareness</h2>
        <p className="section-sub">Interactive charts, collection insights, and environmental awareness</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 22 }}>
        <StatTile icon={BarChart3} label="Total Waste Collected" value={`${wasteData.totalCollected.toLocaleString()} kg`} color="#16a34a" bg="#dcfce7" />
        <StatTile icon={Leaf} label="Organic Waste" value={`${wasteData.organic.toLocaleString()} kg`} sub={`${Math.round((wasteData.organic / total) * 100)}% of total`} color="#22c55e" bg="#f0fdf4" />
        <StatTile icon={Recycle} label="Recyclable Waste" value={`${wasteData.recyclable.toLocaleString()} kg`} sub={`${Math.round((wasteData.recyclable / total) * 100)}% of total`} color="#2563eb" bg="#dbeafe" />
        <StatTile icon={Trash2} label="Non-Recyclable" value={`${wasteData.nonRecyclable.toLocaleString()} kg`} sub={`${Math.round((wasteData.nonRecyclable / total) * 100)}% of total`} color="#f59e0b" bg="#ffedd5" />
      </div>

      {/* Tabs */}
      <div className="tab-nav" style={{ marginBottom: 22 }}>
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          📊 Charts & Overview
        </button>
        <button className={`tab-btn ${activeTab === 'route' ? 'active' : ''}`} onClick={() => setActiveTab('route')}>
          🗺️ Route Suggestions
        </button>
        <button className={`tab-btn ${activeTab === 'awareness' ? 'active' : ''}`} onClick={() => setActiveTab('awareness')}>
          🌿 Waste Awareness
        </button>
      </div>

      {activeTab === 'overview' && (
        <div>
          <div className="grid-charts" style={{ marginBottom: 20 }}>
            {/* Pie */}
            <div className="chart-container">
              <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: '#0f3d23', margin: '0 0 16px', fontSize: '1rem' }}>
                Waste Category Distribution
              </h3>
              <div style={{ maxWidth: 320, margin: '0 auto' }}>
                <Pie data={pieData} options={{ ...CHART_OPTIONS_BASE, aspectRatio: 1.2 }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 16 }}>
                {[
                  { label: 'Organic', value: wasteData.organic, color: '#22c55e' },
                  { label: 'Recyclable', value: wasteData.recyclable, color: '#3b82f6' },
                  { label: 'Non-Recycle', value: wasteData.nonRecyclable, color: '#f59e0b' },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: 'center', padding: '8px', background: '#f9fef9', borderRadius: 8 }}>
                    <div style={{ fontWeight: 700, color: s.color, fontSize: '1rem', fontFamily: 'Poppins,sans-serif' }}>{s.value.toLocaleString()}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{s.label} (kg)</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar weekly */}
            <div className="chart-container">
              <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: '#0f3d23', margin: '0 0 16px', fontSize: '1rem' }}>
                Weekly Waste Collection (kg)
              </h3>
              <Bar data={barData} options={{
                ...CHART_OPTIONS_BASE,
                plugins: { ...CHART_OPTIONS_BASE.plugins, legend: { display: false } },
                scales: { y: { beginAtZero: true, grid: { color: '#f0f0f0' } }, x: { grid: { display: false } } },
              }} />
            </div>
          </div>

          {/* Line chart */}
          <div className="chart-container" style={{ marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: '#0f3d23', margin: '0 0 16px', fontSize: '1rem' }}>
              Monthly Waste Collection Trend (kg)
            </h3>
            <Line data={lineData} options={{
              ...CHART_OPTIONS_BASE,
              plugins: { ...CHART_OPTIONS_BASE.plugins, legend: { display: false } },
              scales: { y: { beginAtZero: false, grid: { color: '#f0f0f0' } }, x: { grid: { display: false } } },
            }} />
          </div>

          {/* Bin fill bar chart */}
          <div className="chart-container">
            <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: '#0f3d23', margin: '0 0 8px', fontSize: '1rem' }}>
              Current Bin Fill Levels (%)
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.78rem', color: '#6b7280' }}>
              🟢 Normal (&lt;70%) &nbsp;&nbsp; 🟡 Nearly Full (70–84%) &nbsp;&nbsp; 🔴 Critical/Full (≥85%)
            </p>
            <Bar data={binFillData} options={{
              ...CHART_OPTIONS_BASE,
              plugins: { ...CHART_OPTIONS_BASE.plugins, legend: { display: false } },
              scales: {
                y: { beginAtZero: true, max: 100, grid: { color: '#f0f0f0' }, ticks: { callback: v => v + '%' } },
                x: { grid: { display: false } },
              },
            }} />
          </div>
        </div>
      )}

      {activeTab === 'route' && <RouteSuggestions />}
      {activeTab === 'awareness' && <WasteAwareness />}
    </div>
  );
}
