// store/AppContext.jsx – Global state management using React Context + localStorage persistence

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { initialState } from './initialData';

const AppContext = createContext(null);

// ─── Reducer ───────────────────────────────────────────────────────────────────
function appReducer(state, action) {
  switch (action.type) {

    // ── Complaints ──────────────────────────────────────────────────
    case 'ADD_COMPLAINT': {
      const id = `ECO-${String(state.nextComplaintId).padStart(4, '0')}`;
      const complaint = {
        ...action.payload,
        id,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [{ status: 'Pending', timestamp: new Date().toISOString(), note: 'Complaint registered' }],
      };
      return {
        ...state,
        complaints: [complaint, ...state.complaints],
        nextComplaintId: state.nextComplaintId + 1,
        notifications: [
          {
            id: Date.now(),
            type: 'info',
            message: `New complaint ${id} registered by ${complaint.citizenName}`,
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    case 'UPDATE_COMPLAINT_STATUS': {
      const { id, status, note } = action.payload;
      return {
        ...state,
        complaints: state.complaints.map(c =>
          c.id === id
            ? {
                ...c,
                status,
                updatedAt: new Date().toISOString(),
                history: [
                  ...c.history,
                  { status, timestamp: new Date().toISOString(), note: note || `Status changed to ${status}` },
                ],
              }
            : c
        ),
        notifications: [
          {
            id: Date.now(),
            type: status === 'Resolved' ? 'success' : 'info',
            message: `Complaint ${id} status updated to ${status}`,
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    case 'DELETE_COMPLAINT':
      return { ...state, complaints: state.complaints.filter(c => c.id !== action.payload) };

    // ── Smart Bins ──────────────────────────────────────────────────
    case 'UPDATE_BIN_LEVEL': {
      const { binId, level } = action.payload;
      const newLevel = Math.min(100, Math.max(0, level));
      const bin = state.bins.find(b => b.id === binId);
      const prevLevel = bin?.fillLevel ?? 0;
      const wasOk = prevLevel < 85;
      const isNowFull = newLevel >= 85;

      let newNotifs = [...state.notifications];
      if (wasOk && isNowFull) {
        newNotifs = [
          {
            id: Date.now(),
            type: 'warning',
            message: `⚠️ Bin ${binId} at ${bin?.location} is ${newLevel >= 100 ? 'OVERFLOWING' : 'nearly full'} (${newLevel}%)`,
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...newNotifs,
        ];
      }

      return {
        ...state,
        bins: state.bins.map(b =>
          b.id === binId
            ? { ...b, fillLevel: newLevel, lastUpdated: new Date().toISOString(), simulated: true }
            : b
        ),
        notifications: newNotifs,
      };
    }

    case 'MARK_BIN_COLLECTED': {
      const { binId } = action.payload;
      const bin = state.bins.find(b => b.id === binId);
      const wasteKg = bin ? Math.round(bin.fillLevel * 0.8) : 0;
      const today = new Date().toDateString();

      return {
        ...state,
        bins: state.bins.map(b =>
          b.id === binId
            ? { ...b, fillLevel: 0, lastUpdated: new Date().toISOString(), lastCollected: new Date().toISOString(), simulated: false }
            : b
        ),
        collectionSchedule: state.collectionSchedule.map(s =>
          s.binId === binId && s.status !== 'Collected'
            ? { ...s, status: 'Collected', collectedAt: new Date().toISOString() }
            : s
        ),
        wasteData: {
          ...state.wasteData,
          totalCollected: state.wasteData.totalCollected + wasteKg,
          dailyCollection: state.wasteData.dailyCollection.map(d =>
            d.date === today ? { ...d, kg: d.kg + wasteKg } : d
          ),
        },
        notifications: [
          {
            id: Date.now(),
            type: 'success',
            message: `✅ Bin ${binId} at ${bin?.location} marked as collected. ~${wasteKg}kg waste.`,
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...state.notifications,
        ],
      };
    }

    case 'ADD_BIN': {
      const newBin = {
        ...action.payload,
        id: `BIN-${String(state.bins.length + 1).padStart(3, '0')}`,
        fillLevel: 0,
        lastUpdated: new Date().toISOString(),
        simulated: false,
      };
      return { ...state, bins: [...state.bins, newBin] };
    }

    case 'UPDATE_COLLECTION_STATUS': {
      const { scheduleId, status } = action.payload;
      return {
        ...state,
        collectionSchedule: state.collectionSchedule.map(s =>
          s.id === scheduleId ? { ...s, status, updatedAt: new Date().toISOString() } : s
        ),
      };
    }

    case 'ADD_SCHEDULE': {
      const newSched = {
        ...action.payload,
        id: `SCH-${Date.now()}`,
        status: 'Scheduled',
        createdAt: new Date().toISOString(),
      };
      return { ...state, collectionSchedule: [newSched, ...state.collectionSchedule] };
    }

    // ── Notifications ───────────────────────────────────────────────
    case 'MARK_NOTIF_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };

    case 'MARK_ALL_NOTIFS_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };

    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };

    // ── Analytics ───────────────────────────────────────────────────
    case 'UPDATE_WASTE_DATA':
      return { ...state, wasteData: { ...state.wasteData, ...action.payload } };

    // ── Settings ────────────────────────────────────────────────────
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    // ── Simulation ──────────────────────────────────────────────────
    case 'SIMULATE_ALL_BINS': {
      let newNotifs = [...state.notifications];
      const updatedBins = state.bins.map(b => {
        const delta = Math.floor(Math.random() * 12) - 2;
        const newLevel = Math.min(100, Math.max(0, b.fillLevel + delta));
        if (b.fillLevel < 85 && newLevel >= 85) {
          newNotifs = [
            {
              id: Date.now() + Math.random(),
              type: 'warning',
              message: `⚠️ Bin ${b.id} at ${b.location} reached ${newLevel}% fill level!`,
              timestamp: new Date().toISOString(),
              read: false,
            },
            ...newNotifs,
          ];
        }
        return { ...b, fillLevel: newLevel, lastUpdated: new Date().toISOString(), simulated: true };
      });
      return { ...state, bins: updatedBins, notifications: newNotifs };
    }

    default:
      return state;
  }
}

// ─── Provider ──────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const saved = (() => {
    try {
      const raw = localStorage.getItem('ecotrack-state');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  const [state, dispatch] = useReducer(appReducer, saved || initialState);

  // Persist to localStorage on every change
  useEffect(() => {
    try { localStorage.setItem('ecotrack-state', JSON.stringify(state)); }
    catch { /* quota exceeded */ }
  }, [state]);

  const value = { state, dispatch };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
