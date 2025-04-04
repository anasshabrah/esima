// src/app/admin/layout.tsx

'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Head from 'next/head';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import AdminAuthGuard from '@/components/admin/AdminAuthGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  // Determine if we are on the signin page.
  const isSignInPage = pathname.startsWith('/admin/signin');

  return (
    <>
      {/* All admin pages will have noindex, nofollow */}
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AdminAuthProvider>
        <AdminAuthGuard>
          {isSignInPage ? (
            // For /admin/signin, render only the main content.
            <main className="flex-1">{children}</main>
          ) : (
            <div className="flex h-screen bg-gray-100">
              <AdminSidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                  {children}
                </main>
              </div>
            </div>
          )}
        </AdminAuthGuard>
      </AdminAuthProvider>
    </>
  );
}
