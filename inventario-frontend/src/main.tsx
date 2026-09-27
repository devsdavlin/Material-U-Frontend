import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/global.css';

if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCKS === 'true') {
  import('./mockServer').then(({ startMockServer }) => {
    startMockServer();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);