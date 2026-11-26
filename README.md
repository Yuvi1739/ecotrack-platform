# 🌿 EcoTrack – Smart Waste Management & Analytics Platform

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-2.13-22c55e)](https://recharts.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **EcoTrack** is a state-of-the-art Smart City Waste Management System designed to modernize urban sanitation through mobile grievance reporting, IoT smart bin telemetry, automated overflow alerts, dynamic route optimization, and interactive waste analytics.

---

## 📌 Project Overview

Rapid urbanization has placed severe strain on municipal waste infrastructures, leading to overflowing roadside bins, delayed pickups, and low recycling rates. **EcoTrack** bridges the gap between citizens and municipal authorities through an intuitive, eco-themed digital dashboard.

### Key Capabilities:
- **Citizen Empowerment**: Report overflowing or uncollected garbage with instant photo uploads, category tagging, and automatic browser GPS geolocation.
- **5-Stage Grievance Tracking**: Real-time status progression (`Submitted` ➔ `Pending` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved`).
- **IoT Smart Bin Telemetry**: Real-time fill levels, battery %, temperature, and odor monitoring with an interactive OpenStreetMap Leaflet interface.
- **Automated Threshold Alarms**: Instant notifications when any bin reaches or exceeds **80% fill capacity**.
- **Dynamic Collection Route Optimization**: Heuristic TSP route ordering for compactor trucks based on critical bins and verified complaints, calculating time, distance, fuel saved, and CO₂ reductions.
- **Waste Analytics & Environmental Awareness**: Comprehensive Recharts visualizations, interactive 4-stream waste segregation guide, drag-and-drop sorting quiz, and household carbon footprint calculator.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | **React.js 18.3** (Vite build tool) |
| **Styling & Theme** | **Tailwind CSS 3.4** (Emerald & Eco-Green color system) |
| **State & Persistence** | **React Context API** + **HTML5 LocalStorage** for persistent demo data |
| **Interactive Mapping** | **Leaflet 1.9** + OpenStreetMap tiles with custom pulsing HTML markers |
| **Data Visualizations** | **Recharts 2.13** (Area, Bar, and Donut Pie charts) |
| **Iconography** | **Lucide React** |
| **Celebrations & UX** | **Canvas-Confetti** (triggers on resolution and quiz completion) |

---

## 📱 Dashboard Modules & Pages

EcoTrack features **11 dedicated pages** spanning all requirements:

### 1. User Reporting & Complaint Management (Module 1)
- **`Report Complaint`**: Interactive reporting form supporting:
  - Complaint categories: *Overflowing Garbage, Uncollected Garbage, Illegal Dumping, Damaged Smart Bin, Hazardous Waste, Foul Odor*.
  - Priority levels (*Low, Medium, High*).
  - Browser Geolocation API (`navigator.geolocation`) with one-click GPS coordinate capture.
  - Image upload with live preview and pre-packaged sample photographs for immediate demonstration.
  - Unique ID generation: `ECO-2025-XXXX`.
- **`My Complaints`**: Citizen complaint history with search, category filtering, status tabs, and tracking timeline modals.
- **`Status Progression Tracker`**: Visual 5-step audit log:
  1. `Submitted` (Ticket logged with photo & coordinates)
  2. `Pending` (Verified by Ward Sanitation Desk)
  3. `Assigned` (Crew and vehicle allocated)
  4. `In Progress` (Compactor truck en route)
  5. `Resolved` (Clearance photo verified and closed)

### 2. Smart Bin Monitoring & Notifications (Module 2)
- **`Smart Bin Monitoring`**:
  - Grid & Leaflet Map split views.
  - Color-coded conditions:
    - 🟢 **Normal**: `< 60%`
    - 🟡 **Almost Full**: `60% – 79%`
    - 🔴 **Critical / Full**: `≥ 80%` (Pulsing radar marker & alert state)
  - Telemetry stats per bin: Capacity (Liters), Battery Level, Temperature, Odor Level, Last Emptied timestamp.
  - **Simulated IoT Engine**: A dedicated control banner clearly tagged **SIMULATED SENSOR DATA (IoT Telemetry Emulated)**. Allows toggling background telemetry simulation, triggering random fill fluctuations, and manual slider overrides to simulate a bin reaching 85%+ and triggering real-time alarms.
- **`Notifications & Alerts`**:
  - Live alert feed with high-priority threshold alerts, complaint assignments, and system notices.
  - One-click trigger for demonstration alarms.

### 3. Waste Analytics & Awareness (Module 3)
- **`Waste Analytics Dashboard`**:
  - Monthly waste collection trends (Area chart with Organic, Recyclable, Hazardous, General streams).
  - Waste category distribution (Donut chart).
  - Ward-wise smart bin fill index (Bar chart).
  - Complaint resolution turnaround metrics (92.4% avg resolution).
  - One-click CSV Export.
- **`Collection Route Optimizer`**:
  - Suggests optimized truck waypoints based on bins `≥ 75%` and urgent complaints.
  - Estimates total travel distance (km), trip duration, fuel conserved (liters), and greenhouse gas (CO₂) avoided.
  - "Dispatch Route" action pushes routes to driver terminals.
- **`Waste Education & Awareness`**:
  - Deep-dive guides for **Wet/Organic**, **Dry/Recyclable**, **Domestic Hazardous**, and **E-Waste**.
  - Interactive **Waste Sorter Game**: 10-question segregation quiz with instant feedback, streaks, and scores.
  - **Household Carbon Footprint Estimator**: Estimates yearly waste produced, landfill diversion potential, and CO₂ reductions based on segregation habits.

### 4. Administrative & Fleet Management
- **`Admin Command Center`**:
  - High-level overview of pending tickets and urgent bins.
  - Triage modal to reassign vehicles (*Compactor Truck, Dry Recovery Truck, Heavy Loader*), update statuses, and log municipal notes.
  - Manual bin override controls (instantly empty containers or bump fill levels).
- **`Fleet Collection Schedules`**:
  - Ward-wise pickup timetables, truck IDs, driver phone numbers, completed stops progress bar, and "Add New Schedule" modal.
- **`Profile & Settings`**:
  - Switch roles with one click (*Citizen* ⟷ *Admin*).
  - Configure push/SMS alert subscriptions.
  - **"Factory Reset Demo Data"** button to restore initial state at any time.

---

## 👥 User Roles & Quick Access

EcoTrack implements role-based views with zero login friction:

| Role | Default User | Capabilities |
|---|---|---|
| **Citizen** | Yuvann (`citizen@ecotrack.org`) | Report complaints, upload photos, GPS geotag, track resolution timeline, view bin map, play sorting quiz, calculate carbon footprint. |
| **Administrator** | Vikram Malhotra (`admin@ecotrack.org`) | Triage all complaints, assign drivers/trucks, update statuses, monitor smart bin telemetry, override sensor readings, dispatch collection routes. |

> **Evaluator Tip**: You can toggle between Citizen and Admin mode at any moment using the role pill in the top navigation bar or the Profile page.

---

## 🚀 Installation & How to Run

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended; tested on Node v25)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)

### Setup Steps

1. **Clone or Navigate to the Project Directory**:
   ```bash
   cd c:\Users\dhili\Desktop\EcoTrack
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000` (or the port indicated in your terminal).

4. **Build for Production**:
   ```bash
   npm run build
   ```
   To preview the optimized production build:
   ```bash
   npm run preview
   ```

---

## 🧪 Demonstration & Evaluation Walkthrough

Follow this step-by-step script during project reviews:

1. **Main Overview**:
   - Notice the modern emerald-green smart city layout, stat cards, and live telemetry pulse in the header.
2. **Test Module 1 (Complaint Filing)**:
   - Click **"Report Garbage Issue"**.
   - Select a sample photo preset or upload an image.
   - Click **"Use My Current Location"** to see GPS auto-detection.
   - Click **"Submit Complaint Ticket"** (enjoy the celebration confetti!).
   - Navigate to **"My Complaints"** and click **"Track Status"** to inspect the 5-step timeline.
3. **Test Module 2 (IoT Smart Bins & Alerts)**:
   - Go to **"Smart Bins Map"**.
   - Notice the OpenStreetMap markers (green for normal, yellow for almost full, red pulsing for critical).
   - In the **IoT Sensor Telemetry Engine** banner, select a bin (e.g., `BIN-102`), adjust the slider to **88%**, and click **"Apply Sensor Level"**.
   - Check the **Notification bell** in the top header: notice the instant overfill alert generated for that bin!
   - Click **"Empty"** on any full bin to see it reset to 0% with updated timestamps.
4. **Test Module 3 (Waste Analytics & Route Optimizer)**:
   - Navigate to **"Waste Analytics"**.
   - Examine the Area chart, Category Donut chart, and Ward fill rates.
   - Click **"Recalculate Dynamic Route"** in the Route Optimizer to observe AI sequencing based on live critical bins.
   - Click **"Export CSV"** to download raw telemetry data.
5. **Test Waste Awareness & Quiz**:
   - Go to **"Waste Education & Quiz"**.
   - Play the **Waste Segregation Challenge**: click bins for *Banana Peel*, *Soda Can*, etc. to see instant educational explanations.
   - Adjust the **Eco Footprint Calculator** sliders to calculate annual kilograms diverted from landfills.
6. **Switch to Admin Mode**:
   - In the top header, click the **"Admin"** pill.
   - Go to the **"Admin Command Center"**: triage any complaint, assign a truck (*Rapid Green Response Crew*), and update the status to `In Progress` or `Resolved`.

---

## 📂 Project Architecture

```
EcoTrack/
├── dist/                      # Production build assets
├── public/                    # Static assets
├── src/
│   ├── components/
│   │   ├── analytics/         # Recharts Analytics & RouteOptimizer
│   │   ├── awareness/         # WasteCategoryGuide, WasteSorterGame, EcoFootprintCalculator
│   │   ├── bins/              # BinCard, Leaflet BinMap, IoTSimulationControls
│   │   ├── common/            # StatCard, StatusBadge, FillProgressBar, Modal
│   │   ├── complaints/        # ComplaintCard, ComplaintTimeline, ComplaintDetailModal, AdminComplaintModal
│   │   └── layout/            # Sidebar, Header
│   ├── context/
│   │   └── AppContext.jsx     # Central State, LocalStorage persistence, IoT simulation engine
│   ├── data/
│   │   └── initialData.js     # Realistic mock data (users, smart bins, complaints, schedules)
│   ├── pages/
│   │   ├── AdminDashboardPage.jsx
│   │   ├── CollectionSchedulePage.jsx
│   │   ├── DashboardOverviewPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── MyComplaintsPage.jsx
│   │   ├── NotificationsPage.jsx
│   │   ├── ProfileSettingsPage.jsx
│   │   ├── ReportComplaintPage.jsx
│   │   ├── SmartBinMonitoringPage.jsx
│   │   ├── WasteAnalyticsPage.jsx
│   │   └── WasteAwarenessPage.jsx
│   ├── App.jsx                # Layout & page router
│   ├── index.css              # Tailwind directives & custom animations
│   └── main.jsx               # React DOM root
├── index.html                 # Main HTML template with Google Fonts & Leaflet CSS
├── package.json               # Dependencies & scripts
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind CSS theme customization
└── vite.config.js             # Vite configuration with chunk splitting
```

---

## 📜 License & Acknowledgments

- Developed for **Academic & Smart City Innovation Demonstrations**.
- Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors.
- Icons by [Lucide](https://lucide.dev/).
