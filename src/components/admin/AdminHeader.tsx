'use client';

import React from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { Bell, User, Menu } from 'lucide-react';

const AdminHeader: React.FC = () => {
  const { admin } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="bg-white shadow h-16 flex items-center justify-between px-6">
      {/* Mobile menu button */}
      <button 
        className="md:hidden text-gray-500 focus:outline-none"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Search bar - can be implemented later */}
      <div className="flex-1 max-w-md ml-4 md:ml-0">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Right side icons */}
      <div className="flex items-center">
        <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none">
          <Bell className="h-5 w-5" />
        </button>
        <div className="ml-3 relative">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <span className="ml-2 text-gray-700 hidden md:block">{admin?.name || 'Admin'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
