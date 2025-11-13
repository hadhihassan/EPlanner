import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiCalendar, FiList, FiBell } from 'react-icons/fi';

const Sidebar = () => {
  const Link = ({ to, children }: any) => (
    <NavLink to={to} className={({ isActive }) => `flex items-center gap-3 p-3 rounded-lg ${isActive ? 'bg-primary text-white' : 'text-slate-700 hover:bg-white'}`}>
      {children}
    </NavLink>
  );

  return (
    <aside className="w-64 bg-white border-r p-6 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">EDENTU</h1>
        <p className="text-sm text-gray-500">Events & Collaboration</p>
      </div>
      <nav className="flex flex-col gap-2">
        <Link to="/dashboard"><FiList />List</Link>
        <Link to="/calendar"><FiCalendar />Calendar</Link>
        <Link to="/notifications"><FiBell />Notifications</Link>
      </nav>
    </aside>
  );
};

export default Sidebar;
