'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  Package, 
  Globe, 
  Tag, 
  Smartphone, 
  CreditCard, 
  Settings, 
  FileText,
  ChevronDown,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  active: boolean;
  hasSubmenu?: boolean;
  expanded?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  href, 
  icon, 
  title, 
  active, 
  hasSubmenu = false,
  expanded = false,
  onClick
}) => {
  return (
    <Link 
      href={href}
      onClick={onClick}
      className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
        active 
          ? 'bg-primary text-white' 
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span className="flex-1">{title}</span>
      {hasSubmenu && (
        <span className="ml-2">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      )}
    </Link>
  );
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAdminAuth();
  
  return (
    <div className="w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-primary">AloData Admin</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Management Dashboard</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          <SidebarItem 
            href="/admin" 
            icon={<LayoutDashboard size={20} />} 
            title="Dashboard" 
            active={pathname === '/admin'} 
          />
          
          <SidebarItem 
            href="/admin/users" 
            icon={<Users size={20} />} 
            title="Users" 
            active={pathname.startsWith('/admin/users')} 
          />
          
          <SidebarItem 
            href="/admin/orders" 
            icon={<ShoppingCart size={20} />} 
            title="Orders" 
            active={pathname.startsWith('/admin/orders')} 
          />
          
          <SidebarItem 
            href="/admin/bundles" 
            icon={<Package size={20} />} 
            title="Bundles" 
            active={pathname.startsWith('/admin/bundles')} 
          />
          
          <SidebarItem 
            href="/admin/countries" 
            icon={<Globe size={20} />} 
            title="Countries" 
            active={pathname.startsWith('/admin/countries')} 
          />
          
          <SidebarItem 
            href="/admin/coupons" 
            icon={<Tag size={20} />} 
            title="Coupons" 
            active={pathname.startsWith('/admin/coupons')} 
          />
          
          <SidebarItem 
            href="/admin/esims" 
            icon={<Smartphone size={20} />} 
            title="eSIMs" 
            active={pathname.startsWith('/admin/esims')} 
          />
          
          <SidebarItem 
            href="/admin/withdrawals" 
            icon={<CreditCard size={20} />} 
            title="Withdrawals" 
            active={pathname.startsWith('/admin/withdrawals')} 
          />
          
          <SidebarItem 
            href="/admin/settings" 
            icon={<Settings size={20} />} 
            title="Settings" 
            active={pathname.startsWith('/admin/settings')} 
          />
          
          <SidebarItem 
            href="/admin/audit-logs" 
            icon={<FileText size={20} />} 
            title="Audit Logs" 
            active={pathname.startsWith('/admin/audit-logs')} 
          />
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {user?.name || user?.email || 'Admin User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Administrator
            </p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <LogOut size={18} className="mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
