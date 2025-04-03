// src/app/admin/layout.tsx

'use client';

import React, { ReactNode } from 'react';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminAuthProvider>
      <AdminAuthGuard>
        <div className="flex h-screen bg-gray-100">
          <AdminSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <AdminHeader />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
              {children}
            </main>
          </div>
        </div>
      </AdminAuthGuard>
    </AdminAuthProvider>
  );
}
