import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Vault from './pages/Vault.jsx'
import Peripherals from './pages/Peripherals.jsx'
import Map from './pages/Map.jsx'
import SignIn from './pages/auth/SignIn.jsx'
import SignUp from './pages/auth/SignUp.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import ProfilePanel from './components/ProfilePanel.jsx'
import { useSpion } from './context/SpionContext.jsx'
import SecurityLogs from "./pages/SecurityLogs.jsx"

<Route 
 path="/security"
 element={<SecurityLogs />}
/>

export default function App() {
  const { isAuthenticated } = useSpion()

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '272px 1fr',
        height: '100vh',
        width: '100vw',
        background: 'var(--bg-void)'
      }}
    >
      <Sidebar />
      <main
        className="scroll-region"
        style={{
          overflowY: 'auto',
          position: 'relative'
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vault" element={<Vault />} />
          <Route path="/peripherals" element={<Peripherals />} />
          <Route path="/map" element={<Map />} />
          <Route path="/signin" element={<Navigate to="/" replace />} />
          <Route path="/signup" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <SettingsPanel />
      <ProfilePanel />
    </div>
  )
}