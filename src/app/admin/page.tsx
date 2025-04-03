'use client';

import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, ShoppingCart, Package, ArrowUp, ArrowDown } from 'lucide-react';
import KPICard from '@/components/admin/dashboard/KPICard';
import FinancialChart from '@/components/admin/dashboard/FinancialChart';
import SystemHealthMonitor from '@/components/admin/dashboard/SystemHealthMonitor';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function AdminDashboard() {
  const { user } = useAdminAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeEsims: 0,
    pendingWithdrawals: 0,
    revenueChange: 0,
    ordersChange: 0,
    usersChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch('/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name || 'Admin'}</h1>
        <p className="text-gray-500 dark:text-gray-400">Here's what's happening with your business today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KPICard 
          title="Total Users" 
          value={stats.totalUsers.toString()} 
          icon={<Users className="h-6 w-6 text-blue-500" />}
          change={stats.usersChange}
          changeDirection={stats.usersChange >= 0 ? 'up' : 'down'}
          changeLabel={`${Math.abs(stats.usersChange)}% from last month`}
        />
        <KPICard 
          title="Total Orders" 
          value={stats.totalOrders.toString()} 
          icon={<ShoppingCart className="h-6 w-6 text-green-500" />}
          change={stats.ordersChange}
          changeDirection={stats.ordersChange >= 0 ? 'up' : 'down'}
          changeLabel={`${Math.abs(stats.ordersChange)}% from last month`}
        />
        <KPICard 
          title="Total Revenue" 
          value={formatCurrency(stats.totalRevenue)} 
          icon={<LayoutDashboard className="h-6 w-6 text-purple-500" />}
          change={stats.revenueChange}
          changeDirection={stats.revenueChange >= 0 ? 'up' : 'down'}
          changeLabel={`${Math.abs(stats.revenueChange)}% from last month`}
        />
        <KPICard 
          title="Active eSIMs" 
          value={stats.activeEsims.toString()} 
          icon={<Package className="h-6 w-6 text-orange-500" />}
          change={0}
          changeLabel="Currently active"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue Overview</h2>
            <FinancialChart />
          </div>
        </div>
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Health</h2>
            <SystemHealthMonitor />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Orders</h2>
            <a href="/admin/orders" className="text-primary hover:text-primary-dark text-sm">View all</a>
          </div>
          {/* Placeholder for recent orders list */}
          <div className="space-y-4">
            <p className="text-gray-500 dark:text-gray-400">Loading recent orders...</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Pending Withdrawals</h2>
            <a href="/admin/withdrawals" className="text-primary hover:text-primary-dark text-sm">View all</a>
          </div>
          {/* Placeholder for pending withdrawals */}
          <div className="space-y-4">
            <p className="text-gray-500 dark:text-gray-400">
              {stats.pendingWithdrawals > 0 
                ? `${stats.pendingWithdrawals} withdrawal requests pending approval` 
                : 'No pending withdrawal requests'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
