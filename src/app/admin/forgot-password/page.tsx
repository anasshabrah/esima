'use client';

import React from 'react';
import AdminForgotPasswordForm from './AdminForgotPasswordForm';

export default function AdminForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          {/* H1 and description */}
          <h1 className="text-3xl font-extrabold mb-4 text-primary text-center">
            Forgot Admin Password
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Enter your email address below and we'll send you a link to reset your password.
          </p>

          {/* Admin Forgot Password Form */}
          <AdminForgotPasswordForm />
        </div>
      </main>
    </div>
  );
}
