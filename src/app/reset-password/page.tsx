// src/app/reset-password/page.tsx

import React from 'react';
import ResetPasswordForm from './ResetPasswordForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password - alodata',
  description: 'Reset your password to regain access to your account.',
  robots: {
    index: false,
    follow: true,
  },
};

const ResetPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          {/* H1 and description */}
          <h1 className="text-3xl font-extrabold mb-4 text-primary text-center">
            Reset Your Password
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Enter your new password below to secure your account.
          </p>

          {/* Reset Password Form */}
          <ResetPasswordForm />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ResetPasswordPage;
