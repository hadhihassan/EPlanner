import React from 'react';

const AuthLayout: React.FC<{children: React.ReactNode}> = ({ children }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
    {children}
  </div>
);

export default AuthLayout;
