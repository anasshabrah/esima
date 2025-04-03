// src/app/signin/page.tsx

import React from 'react';
import SignInForm from './SignInForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - alodata',
  description: 'Sign in to access your account and manage your referrals.',
  robots: {
    index: false,
    follow: true,
  },
};

const SignInPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          {/* H1 and description */}
          <h1 className="text-3xl font-extrabold mb-4 text-primary text-center">
            Partner Sign In
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Log in to your dashboard to manage referrals and monitor your progress. Exclusively for Partners, not Customers.
          </p>

          {/* SignIn Form */}
          <SignInForm />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SignInPage;
