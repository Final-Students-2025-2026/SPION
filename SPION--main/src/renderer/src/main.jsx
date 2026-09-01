import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { SpionProvider } from './context/SpionContext.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <SpionProvider>
        <App />
      </SpionProvider>
    </HashRouter>
  </React.StrictMode>
)
