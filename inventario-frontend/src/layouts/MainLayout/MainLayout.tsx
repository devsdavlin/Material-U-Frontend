import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar/Sidebar';

export const MainLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '30px', backgroundColor: '#fff' }}>
        <Outlet />
      </main>
    </div>
  );
};