'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  DollarSign, 
  CheckCircle,
  XCircle,
  Clock,
  User,
  CreditCard
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function WithdrawalDetailsPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { user: adminUser } = useAdminAuth();
  const [withdrawal, setWithdrawal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchWithdrawalDetails();
  }, [id]);

  const fetchWithdrawalDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`/api/admin/withdrawals/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch withdrawal details');
      }

      const data = await response.json();
      setWithdrawal(data.withdrawal);
      setUpdateStatus(data.withdrawal.status);
    } catch (err) {
      console.error('Error fetching withdrawal details:', err);
      setError('Failed to load withdrawal details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const payload = {
        status: updateStatus
      };

      if (updateStatus === 'REJECTED' && rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }

      const response = await fetch(`/api/admin/withdrawals/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to update withdrawal status');
      }

      // Close modal and refresh withdrawal details
      setShowUpdateModal(false);
      fetchWithdrawalDetails();
    } catch (err) {
      console.error('Error updating withdrawal status:', err);
      setError(err.message || 'Failed to update withdrawal status');
    } finally {
      setUpdating(false);
    }
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

  if (!withdrawal) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Withdrawal not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">The withdrawal request you're looking for doesn't exist or you don't have permission to view it.</p>
        <button
          onClick={() => router.push('/admin/withdrawals')}
          className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary-light"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Withdrawals
        </button>
      </div>
    );
  }

  const canUpdateStatus = withdrawal.status === 'PENDING' || withdrawal.status === 'PROCESSING';

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <button
            onClick={() => router.push('/admin/withdrawals')}
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Withdrawals
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Withdrawal Request #{withdrawal.id}</h1>
        </div>
        {canUpdateStatus && (
          <button
            onClick={() => setShowUpdateModal(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary-light"
          >
            <Save className="w-4 h-4 mr-2" />
            Update Status
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2 text-primary" />
            Withdrawal Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
              <p className="font-medium text-gray-900 dark:text-white text-xl">
                {formatCurrency(withdrawal.amount, withdrawal.currency || 'USD')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getStatusBadgeClass(withdrawal.status)}`}>
                {withdrawal.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Request Date</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(withdrawal.createdAt).toLocaleString()}
              </p>
            </div>
            {withdrawal.processedAt && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Processed Date</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(withdrawal.processedAt).toLocaleString()}
                </p>
              </div>
            )}
            {withdrawal.rejectionReason && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Rejection Reason</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {withdrawal.rejectionReason}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-primary" />
            Affiliate Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {withdrawal.user?.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {withdrawal.user?.email || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Affiliate ID</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {withdrawal.user?.id || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Country</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {withdrawal.user?.country || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-primary" />
            Payment Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {withdrawal.paymentMethod || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Account Details</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {withdrawal.accountDetails || 'N/A'}
              </p>
            </div>
            {withdrawal.transactionId && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Transaction ID</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {withdrawal.transactionId}
                </p>
              </div>
            )}
            {withdrawal.notes && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {withdrawal.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Affiliate Balance Information */}
      {withdrawal.user?.affiliateBalance && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Affiliate Balance</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Balance</h3>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(withdrawal.user.affiliateBalance.currentBalance, 'USD')}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Lifetime Earnings</h3>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(withdrawal.user.affiliateBalance.lifetimeEarnings, 'USD')}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pending Withdrawals</h3>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(withdrawal.user.affiliateBalance.pendingWithdrawals, 'USD')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Update Withdrawal Status</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </label>
                <select
                  id="status"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {updateStatus === 'REJECTED' && (
                <div>
                  <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Rejection Reason
                  </label>
                  <textarea
                    id="rejectionReason"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection"
                  />
                </div>
              )}

              {updateStatus === 'COMPLETED' && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 dark:bg-yellow-900/20 dark:border-yellow-700">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        Make sure you have processed this payment through your payment provider before marking it as completed.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowUpdateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={updating || (updateStatus === 'REJECTED' && !rejectionReason)}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
