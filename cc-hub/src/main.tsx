import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Note: StrictMode removed because it causes double-mounting which
// breaks Three.js geometry/material lifecycle (causes blank objects)
createRoot(document.getElementById('root')!).render(<App />)
