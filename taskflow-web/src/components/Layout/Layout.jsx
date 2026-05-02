// src/components/Layout/Layout.jsx

import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileDrawer from './MobileDrawer';

const Layout = ({ children }) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <MobileDrawer 
        isOpen={mobileDrawerOpen} 
        onClose={() => setMobileDrawerOpen(false)} 
      />
      
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setMobileDrawerOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;