'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  Globe, 
  Tag, 
  Settings,
  CreditCard,
  FileText,
  LogOut
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: <Package className="w-5 h-5" /> },
    { name: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { name: 'Orders', href: '/admin/orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { name: 'Bundles', href: '/admin/bundles', icon: <Package className="w-5 h-5" /> },
    { name: 'Countries', href: '/admin/countries', icon: <Globe className="w-5 h-5" /> },
    { name: 'Coupons', href: '/admin/coupons', icon: <Tag className="w-5 h-5" /> },
    { name: 'eSIMs', href: '/admin/esims', icon: <CreditCard className="w-5 h-5" /> },
    { name: 'Withdrawals', href: '/admin/withdrawals', icon: <CreditCard className="w-5 h-5" /> },
    { name: 'Settings', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-primary text-white w-64 flex-shrink-0 hidden md:block">
      <div className="h-16 flex items-center justify-center border-b border-primary-dark">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </div>
      <div className="p-4">
        <div className="mb-6">
          <p className="text-sm text-gray-300">Logged in as:</p>
          <p className="font-medium">{admin?.name || 'Admin'}</p>
          <p className="text-sm text-gray-300">{admin?.email || ''}</p>
        </div>
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    pathname === item.href
                      ? 'bg-primary-dark text-white'
                      : 'text-gray-300 hover:bg-primary-dark hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              </li>
            ))}
            <li>
              <button
                onClick={logout}
                className="w-full flex items-center px-4 py-2 rounded-lg transition-colors text-gray-300 hover:bg-primary-dark hover:text-white"
              >
                <LogOut className="w-5 h-5" />
                <span className="ml-3">Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
