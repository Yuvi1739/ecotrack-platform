// pages/Settings.jsx – Application Settings
import React, { useState } from 'react';
import {
  Settings as SettingsIcon, Save, Bell, Cpu, Globe, User, Shield,
  RefreshCw, Database, Trash2, Info,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { initialState } from '../store/initialData';
import Toast from '../components/shared/Toast';
import ConfirmDialog from '../components/shared/ConfirmDialog';

export default function Settings() {
  const { state, dispatch } = useApp();
  const [form, setForm] = useState({ ...state.settings });
  const [toast, setToast] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: form });
    showToast('Settings saved successfully!');
  };

  const handleReset = () => {
    localStorage.removeItem('ecotrack-state');
    window.location.reload();
  };

  const SECTIONS = [
    {
      title: 'Organization Details',
      icon: User,
      fields: [
        { key: 'adminName', label: 'Admin Name', type: 'text', placeholder: 'Administrator name' },
        { key: 'orgName', label: 'Organization', type: 'text', placeholder: 'Municipal corporation name' },
        { key: 'city', label: 'City', type: 'text', placeholder: 'City name' },
      ],
    },
    {
      title: 'Alert Thresholds',
      icon: Bell,
      fields: [
        { key: 'alertThreshold', label: 'Bin Alert Threshold (%)', type: 'number', min: 50, max: 95, note: 'Generate alert when bin fill level exceeds this percentage' },
        { key: 'simulateInterval', label: 'Simulation Interval (seconds)', type: 'number', min: 5, max: 120, note: 'How often auto-simulation updates all bins' },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      fields: [],
      toggles: [
        { key: 'emailNotifications', label: 'Email Notifications', desc: 'Send email alerts for new complaints and critical bins' },
        { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Send SMS alerts (requires SMS gateway integration)' },
      ],
    },
    {
      title: 'Regional Settings',
      icon: Globe,
      fields: [
        { key: 'language', label: 'Language', type: 'select', options: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu'] },
        { key: 'timezone', label: 'Timezone', type: 'select', options: ['Asia/Kolkata', 'Asia/Mumbai', 'UTC'] },
      ],
    },
  ];

  return (
    <div style={{ padding: 28, maxWidth: 900 }} className="animate-fade-in">
      <Toast toast={toast} onClose={() => setToast(null)} />
      <ConfirmDialog
        open={confirmReset}
        title="Reset All Data"
        message="This will erase all complaints, bin data, and settings, resetting the app to its initial demo state. This cannot be undone."
        confirmLabel="Reset Everything"
        onConfirm={handleReset}
        onCancel={() => setConfirmReset(false)}
      />

      <div style={{ marginBottom: 22 }}>
        <h2 className="section-header">Settings</h2>
        <p className="section-sub">Configure EcoTrack application preferences and parameters</p>
      </div>

      {SECTIONS.map(section => {
        const Icon = section.icon;
        return (
          <div key={section.title} className="eco-card" style={{ padding: 24, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color="#16a34a" />
              </div>
              <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: '#0f3d23', margin: 0, fontSize: '0.95rem' }}>{section.title}</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {section.fields.map(f => (
                <div key={f.key}>
                  <label className="eco-label">{f.label}</label>
                  {f.type === 'select' ? (
                    <select className="eco-input" value={form[f.key]} onChange={e => set(f.key, e.target.value)}>
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      className="eco-input"
                      type={f.type}
                      min={f.min} max={f.max}
                      value={form[f.key]}
                      onChange={e => set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                      placeholder={f.placeholder}
                    />
                  )}
                  {f.note && <p style={{ margin: '4px 0 0', fontSize: '0.73rem', color: '#9ca3af' }}>{f.note}</p>}
                </div>
              ))}
              {section.toggles?.map(t => (
                <div key={t.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fef9', borderRadius: 10, padding: '14px 16px', gridColumn: '1 / -1' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1a2e1a', fontSize: '0.875rem' }}>{t.label}</div>
                    <div style={{ fontSize: '0.78rem', color: '#9ca3af', marginTop: 2 }}>{t.desc}</div>
                  </div>
                  <div
                    onClick={() => set(t.key, !form[t.key])}
                    style={{
                      width: 44, height: 24, borderRadius: 99,
                      background: form[t.key] ? '#22c55e' : '#d1d5db',
                      cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 3, left: form[t.key] ? 22 : 3,
                      width: 18, height: 18, borderRadius: '50%', background: '#fff',
                      transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* IoT Config Info */}
      <div className="eco-card" style={{ padding: 24, marginBottom: 16, borderLeft: '4px solid #3b82f6' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Cpu size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: '#0f3d23', margin: '0 0 8px', fontSize: '0.95rem' }}>IoT Integration Configuration</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Microcontroller', value: 'ESP32 (WiFi/Bluetooth)' },
                { label: 'Sensor', value: 'HC-SR04 Ultrasonic' },
                { label: 'Communication', value: 'MQTT / Firebase RTDB' },
                { label: 'Protocol', value: 'HTTP REST (Demo Mode)' },
                { label: 'Data Format', value: 'JSON' },
                { label: 'Integration Status', value: '🔵 Demo / Simulation Mode' },
              ].map(f => (
                <div key={f.label} style={{ background: '#eff6ff', borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{f.label}</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1e3a5f' }}>{f.value}</div>
                </div>
              ))}
            </div>
            <p style={{ margin: '12px 0 0', fontSize: '0.78rem', color: '#4b5563', lineHeight: 1.6 }}>
              To connect real ESP32 hardware: Flash the sensor firmware, configure the MQTT broker URL, and update the Firebase config in <code style={{ background: '#e0f2fe', borderRadius: 4, padding: '2px 5px' }}>src/config/iot.config.js</code>
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={handleSave}>
          <Save size={15} /> Save Settings
        </button>
        <button className="btn-secondary" onClick={() => setForm({ ...state.settings })}>
          <RefreshCw size={15} /> Discard Changes
        </button>
        <button className="btn-danger" style={{ marginLeft: 'auto' }} onClick={() => setConfirmReset(true)}>
          <Trash2 size={15} /> Reset All Data
        </button>
      </div>
    </div>
  );
}
