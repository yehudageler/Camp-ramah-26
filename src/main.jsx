import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3500,
        style: {
          fontFamily: "'Varela Round', sans-serif",
          direction: 'rtl',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '0.95rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
        },
        success: {
          iconTheme: { primary: '#1e4620', secondary: '#fff' }
        },
        error: {
          iconTheme: { primary: '#c62828', secondary: '#fff' }
        }
      }}
    />
  </StrictMode>,
)
