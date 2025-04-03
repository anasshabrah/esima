// src/app/referral-dashboard/page.tsx

import React from 'react';
import ReferralDashboard from './ReferralDashboard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Referral Dashboard - alodata',
  description: 'Manage your referrals, track sales, and view your earnings.',
  robots: {
    index: false,
    follow: true,
  },
};

const ReferralDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ReferralDashboard />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ReferralDashboardPage;
