# SPION — Smart Protection & Intrusion Observation Network

Desktop app (Electron + React) — frontend milestone.

This is a real, installable desktop application shell. Right now it runs entirely on
mock data defined in `src/renderer/src/context/SpionContext.jsx`. Nothing here talks to
a camera, a filesystem, or a real OS lock screen yet — that's the backend milestone.

## What's built

- **Dashboard** — protection/camera/intruder stat cards, security timeline, recent
  intruder photos panel (empty state), quick actions, system overview.
- **Vault** — passcode gate (any 4+ characters unlocks it for now) → file/folder grid.
- **Peripherals** — connected device table with authorized/blocked status.
- Sidebar navigation, search field (UI only for now), settings/profile placeholders.

## Stack

- Electron 33 (desktop shell)
- React 18 + React Router (UI)
- electron-vite (dev server + build pipeline)
- Framer Motion (motion/micro-interactions)
- lucide-react (icons)
- Space Grotesk / Inter / JetBrains Mono, bundled locally via @fontsource (no
  internet connection required at runtime)

## Project structure

```
spion-app/
├─ src/
│  ├─ main/            → Electron main process (opens the native window)
│  ├─ preload/          → secure bridge between main process and the UI
│  └─ renderer/          → the React app (everything you see on screen)
│     ├─ index.html
│     └─ src/
│        ├─ components/  → Sidebar, Panel, StatCard, RadarMark, etc.
│        ├─ pages/        → Dashboard.jsx, Vault.jsx, Peripherals.jsx
│        ├─ context/      → SpionContext.jsx (all mock state lives here)
│        └─ styles/       → global.css (design tokens/colors/fonts)
├─ electron.vite.config.js
└─ package.json
```

## Run it

```bash
npm install
npm run dev
```

This opens the actual desktop app in a live-reloading dev window.

## Build an installable app later

```bash
npm run build
```
