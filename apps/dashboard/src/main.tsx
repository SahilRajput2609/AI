import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

try {
  console.log('main.tsx: Starting initialization')
  const rootEl = document.getElementById('root')
  console.log('main.tsx: Root element:', rootEl)

  if (!rootEl) {
    throw new Error('Root element not found')
  }

  const root = createRoot(rootEl)
  console.log('main.tsx: Root created, rendering App...')

  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )

  console.log('main.tsx: App rendered successfully')
} catch (error) {
  console.error('main.tsx: Error during render:', error)
  const rootEl = document.getElementById('root')
  if (rootEl) {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : ''
    const html = `
      <div style="background: #000; color: #fff; padding: 40px; font-family: monospace; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
        <div style="max-width: 600px; background: #1a1a1a; border: 1px solid #333; padding: 20px; border-radius: 8px;">
          <h1 style="color: #ff6b6b; margin-top: 0;">⚠️ Error Loading App</h1>
          <pre style="color: #ffff00; white-space: pre-wrap; overflow-x: auto; background: #000; padding: 10px; border-radius: 4px;">${message}${stack ? '\n\n' + stack : ''}</pre>
          <p style="color: #aaa; margin-bottom: 0;">Check browser console (F12) for more details.</p>
        </div>
      </div>
    `
    rootEl.innerHTML = html
  }
}

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  const rootEl = document.getElementById('root')
  if (rootEl && !rootEl.innerHTML.includes('Error Loading App')) {
    rootEl.innerHTML = `<div style="background: #000; color: #fff; padding: 20px; font-family: monospace;"><h1 style="color: #ff6b6b;">Runtime Error</h1><pre>${event.error?.message || 'Unknown error'}</pre></div>`
  }
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  const rootEl = document.getElementById('root')
  if (rootEl && !rootEl.innerHTML.includes('Error Loading App')) {
    rootEl.innerHTML = `<div style="background: #000; color: #fff; padding: 20px; font-family: monospace;"><h1 style="color: #ff6b6b;">Promise Rejection</h1><pre>${event.reason?.message || String(event.reason)}</pre></div>`
  }
})
