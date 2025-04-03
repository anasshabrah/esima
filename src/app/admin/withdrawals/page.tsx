'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function WithdrawalsPage() {
  const { user: adminUser } = useAdminAuth();
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchWithdrawals();
  }, [page, limit, searchTerm, statusFilter]);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }

      if (statusFilter !== 'all') {
        queryParams.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/withdrawals?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch withdrawals');
      }

      const data = await response.json();
      setWithdrawals(data.withdrawals);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      console.error('Error fetching withdrawals:', err);
      setError('Failed to load withdrawals. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchWithdrawals();
  };

  const handleViewWithdrawal = (withdrawalId) => {
    router.push(`/admin/withdrawals/${withdrawalId}`);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Withdrawal Management</h1>
        <p className="text-gray-500 dark:text-gray-400">View and manage affiliate withdrawal requests</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="search"
                className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Search by ID or affiliate email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
          
          <div className="flex items-center space-x-3">
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1); // Reset to first page on filter change
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">ID</th>
                <th scope="col" className="px-6 py-3">Affiliate</th>
                <th scope="col" className="px-6 py-3">Amount</th>
                <th scope="col" className="px-6 py-3">Payment Method</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Requested Date</th>
                <th scope="col" className="px-6 py-3">Processed Date</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">No withdrawals found</td>
                </tr>
              ) : (
                withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {withdrawal.id}
                    </td>
                    <td className="px-6 py-4">
                      {withdrawal.user?.email || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatCurrency(withdrawal.amount, withdrawal.currency || 'USD')}
                    </td>
                    <td className="px-6 py-4">
                      {withdrawal.paymentMethod || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getStatusBadgeClass(withdrawal.status)}`}>
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {withdrawal.processedAt ? new Date(withdrawal.processedAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewWithdrawal(withdrawal.id)}
                        className="font-medium text-primary hover:text-primary-dark"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 flex flex-col sm:flex-row justify-between items-center border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-700 dark:text-gray-400 mb-4 sm:mb-0">
            Showing <span className="font-medium">{withdrawals.length}</span> of <span className="font-medium">{total}</span> withdrawals
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`p-2 rounded-lg ${
                page === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`p-2 rounded-lg ${
                page === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
