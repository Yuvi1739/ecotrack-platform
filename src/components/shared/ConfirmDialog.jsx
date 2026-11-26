// components/shared/ConfirmDialog.jsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', type = 'danger' }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: type === 'danger' ? '#fee2e2' : '#ffedd5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={22} color={type === 'danger' ? '#ef4444' : '#f59e0b'} />
          </div>
          <div>
            <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, color: '#0f3d23', margin: '0 0 6px' }}>{title}</h3>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>{message}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button
            onClick={onConfirm}
            className={type === 'danger' ? 'btn-danger' : 'btn-warning'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
