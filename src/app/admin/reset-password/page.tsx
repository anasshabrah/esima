'use client';

import React from 'react';
import AdminResetPasswordForm from './AdminResetPasswordForm';

export default function AdminResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          {/* H1 and description */}
          <h1 className="text-3xl font-extrabold mb-4 text-primary text-center">
            Reset Admin Password
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Enter your new password below to reset your admin account password.
          </p>

          {/* Admin Reset Password Form */}
          <AdminResetPasswordForm />
        </div>
      </main>
    </div>
  );
}
