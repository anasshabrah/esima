'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading, checkAdminStatus } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    const verifyAdmin = async () => {
      const isAdminUser = await checkAdminStatus();
      if (!isAdminUser && !isLoading) {
        router.push('/signin?callbackUrl=/admin');
      }
    };

    verifyAdmin();
  }, [checkAdminStatus, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
