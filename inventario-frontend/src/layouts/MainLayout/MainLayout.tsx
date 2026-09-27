import React from 'react';
import { Outlet } from 'react-router-dom';
import { OfflineBanner } from '../../components/OfflineBanner/OfflineBanner';
import { Sidebar } from '../../components/Sidebar/Sidebar';

export const MainLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: '80px', padding: '30px', backgroundColor: '#fff', minHeight: '100vh' }}>
        <OfflineBanner />
        <Outlet />
      </main>
    </div>
  );
};