import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/global.css';

if (import.meta.env.DEV) {
  // Dynamically import mock server to avoid affecting production bundle
  import('./mockServer').then(({ startMockServer }) => {
    startMockServer();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);