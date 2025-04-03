// src/app/admin/layout.tsx

'use client';

import React from 'react';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminAuthGuard>
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
          <AdminSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <AdminHeader />
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </AdminAuthGuard>
    </AdminAuthProvider>
  );
}
