import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen  bg-[#F5F7FA]">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;