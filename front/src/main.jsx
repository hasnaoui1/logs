import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { RobotsProvider } from './services/RobotsContext.jsx'
import { LogsProvider } from './services/LogsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RobotsProvider>
      <LogsProvider>
          <App />
      </LogsProvider>
    </RobotsProvider>
  </StrictMode>,
)
