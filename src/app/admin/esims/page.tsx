// src/app/admin/esims/page.tsx

'use client';

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sim, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function EsimsPage() {
  const { user: adminUser } = useAdminAuth();
  const router = useRouter();
  const [esims, setEsims] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showRefreshModal, setShowRefreshModal] = useState<boolean>(false);
  const [esimToRefresh, setEsimToRefresh] = useState<any>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    fetchEsims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchTerm, statusFilter]);

  const fetchEsims = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No admin token found');

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      if (searchTerm) queryParams.append('search', searchTerm);
      if (statusFilter !== 'all') queryParams.append('status', statusFilter);

      const response = await fetch(`/api/admin/esims?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch eSIMs');
      }
      const data = await response.json();
      setEsims(data.esims);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.pages);
    } catch (err: any) {
      console.error('Error fetching eSIMs:', err);
      setError(err.message || 'Failed to load eSIMs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEsims();
  };

  const handleViewEsim = (esimId: number) => {
    router.push(`/admin/esims/${esimId}`);
  };

  const handleRefreshEsim = async () => {
    if (!esimToRefresh) return;
    setRefreshing(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No admin token found');

      const response = await fetch(`/api/admin/esims/${esimToRefresh.id}/refresh`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to refresh eSIM status');
      }
      setShowRefreshModal(false);
      setEsimToRefresh(null);
      fetchEsims();
    } catch (err: any) {
      console.error('Error refreshing eSIM:', err);
      setError(err.message || 'Failed to refresh eSIM status');
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">eSIM Management</h1>
        <p className="text-gray-500 dark:text-gray-400">View and manage eSIM profiles</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="search"
                className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="Search by ICCID or order ID"
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
                setPage(1);
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">ICCID</th>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Bundle</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Activation Date</th>
                <th className="px-6 py-3">Expiry Date</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : esims.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">No eSIMs found</td>
                </tr>
              ) : (
                esims.map((esim) => (
                  <tr key={esim.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{esim.id}</td>
                    <td className="px-6 py-4">{esim.iccid || 'N/A'}</td>
                    <td className="px-6 py-4">{esim.order?.id || 'N/A'}</td>
                    <td className="px-6 py-4">{esim.order?.bundle?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getStatusBadgeClass(esim.status)}`}>
                        {esim.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {esim.activationDate ? new Date(esim.activationDate).toLocaleDateString() : 'Not activated'}
                    </td>
                    <td className="px-6 py-4">
                      {esim.expiryDate ? new Date(esim.expiryDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 flex items-center space-x-2">
                      <button
                        onClick={() => handleViewEsim(esim.id)}
                        className="font-medium text-primary hover:text-primary-dark"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEsimToRefresh(esim);
                          setShowRefreshModal(true);
                        }}
                        className="font-medium text-blue-600 hover:text-blue-800"
                        title="Refresh Status"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 flex flex-col sm:flex-row justify-between items-center border-t">
          <div className="text-sm text-gray-700 mb-4 sm:mb-0">
            Showing <span className="font-medium">{esims.length}</span> of <span className="font-medium">{total}</span> eSIMs
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`p-2 rounded-lg ${page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-700">{`Page ${page} of ${totalPages}`}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`p-2 rounded-lg ${page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showRefreshModal && esimToRefresh && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Refresh eSIM Status</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to refresh the status of eSIM with ICCID{' '}
                <span className="font-medium">{esimToRefresh.iccid || 'N/A'}</span>?
                This will query the provider API for the latest status information.
              </p>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowRefreshModal(false);
                  setEsimToRefresh(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRefreshEsim}
                disabled={refreshing}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {refreshing ? 'Refreshing...' : 'Refresh Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
