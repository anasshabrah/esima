// src/components/admin/AdminAuthGuard.tsx

'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Bypass the guard if the current route starts with /admin/signin
  if (pathname.startsWith('/admin/signin')) {
    return <>{children}</>;
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/signin');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
