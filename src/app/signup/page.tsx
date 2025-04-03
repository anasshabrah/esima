// src/app/signup/page.tsx

import React from 'react';
import SignUpForm from './SignUpForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - alodata',
  description: 'Create an account to start managing your referrals and earning money.',
  robots: {
    index: false,
    follow: true,
  },
};

const SignUpPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          {/* H1 and description */}
          <h1 className="text-3xl font-extrabold mb-4 text-primary text-center">
            Create Your Partner Account
          </h1>
          <p className="text-center text-gray-600 mb-6">
            Sign up to start referring others and earning money today.
          </p>

          {/* SignUp Form */}
          <SignUpForm />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SignUpPage;
