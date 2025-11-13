import React from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';

const Topbar = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center gap-4">
        {/* <button className="p-2 rounded-md">☰</button> */}
        <div className="text-lg font-semibold">Dashboard</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">{user?.email}</div>
        <button onClick={() => dispatch(logout())} className="px-3 py-1 rounded-md bg-red-50 text-red-600">Logout</button>
      </div>
    </div>
  );
};

export default Topbar;
