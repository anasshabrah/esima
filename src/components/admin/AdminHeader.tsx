'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Bell, Sun, Moon } from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface AdminHeaderProps {
  toggleSidebar?: () => void;
}

export default function AdminHeader({ toggleSidebar }: AdminHeaderProps) {
  const pathname = usePathname();
  const { user } = useAdminAuth();
  const [darkMode, setDarkMode] = React.useState(false);

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname === '/admin') return 'Dashboard';
    
    const path = pathname.split('/').filter(Boolean);
    if (path.length >= 2) {
      // Capitalize the second part of the path (e.g., /admin/users -> Users)
      return path[1].charAt(0).toUpperCase() + path[1].slice(1);
    }
    
    return 'Admin Panel';
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-900 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <h1 className="ml-2 text-xl font-semibold text-gray-800 dark:text-white lg:ml-0">
            {getPageTitle()}
          </h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-900 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-900 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
            aria-label="View notifications"
          >
            <Bell size={20} />
          </button>
          
          <div className="relative">
            <button
              className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              aria-label="User menu"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'A'}
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
