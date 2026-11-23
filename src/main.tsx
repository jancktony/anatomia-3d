import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useAnatomyStore } from './store/useAnatomyStore'
import { applyTheme } from './lib/themes'

applyTheme(useAnatomyStore.getState().theme) // before the first paint: no flash of the default palette

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
