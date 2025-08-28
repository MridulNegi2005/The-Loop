import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'


// PWA update notification logic
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showPwaUpdateToast();
            }
          });
        }
      });
    });
  });
}

function showPwaUpdateToast() {
  // Simple toast, you can replace with a React portal/modal if you want
  if (document.getElementById('pwa-update-toast')) return;
  const toast = document.createElement('div');
  toast.id = 'pwa-update-toast';
    toast.innerHTML = `
      <div style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#232136;color:#fff;padding:10px 18px;border-radius:14px;box-shadow:0 2px 12px #7c3aed33;z-index:9999;display:flex;align-items:center;gap:10px;font-size:0.98rem;min-width:220px;max-width:90vw;">
        <svg style="width:20px;height:20px;flex-shrink:0;" fill="none" stroke="#a78bfa" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#a78bfa" stroke-width="2" fill="#7c3aed"/><path d="M12 8v4" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="16" r="1" fill="#fff"/></svg>
        <span style="font-weight:500;">New version available.</span>
        <button id="pwa-update-btn" style="background:#fff;color:#7c3aed;font-weight:600;padding:4px 16px;border:none;border-radius:8px;cursor:pointer;font-size:0.98rem;transition:background 0.2s;">Update</button>
      </div>
    `;
  document.body.appendChild(toast);
  document.getElementById('pwa-update-btn').onclick = () => {
    window.location.reload();
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
