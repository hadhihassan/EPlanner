import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { Outlet } from 'react-router-dom';

const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 bg-gray-50 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
