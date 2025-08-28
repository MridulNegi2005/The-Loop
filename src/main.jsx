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
    <div style="position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#7c3aed;color:#fff;padding:16px 32px;border-radius:999px;box-shadow:0 4px 24px #7c3aed55;z-index:9999;display:flex;align-items:center;gap:16px;font-size:1.1rem;">
      <span style="font-weight:bold;">A new version is available.</span>
      <button id="pwa-update-btn" style="background:#fff;color:#7c3aed;font-weight:bold;padding:8px 18px;border:none;border-radius:999px;cursor:pointer;">Update</button>
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
