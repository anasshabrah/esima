'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Package, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { AdminBundle, ErrorState, InputChangeEvent } from '@/types/admin';

export default function BundlesPage() {
  const { user: adminUser } = useAdminAuth();
  const router = useRouter();
  const [bundles, setBundles] = useState<AdminBundle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ErrorState>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [bundleToDelete, setBundleToDelete] = useState<AdminBundle | null>(null);

  useEffect(() => {
    fetchBundles();
  }, [page, limit, searchTerm]);

  const fetchBundles = async () => {
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

      const response = await fetch(`/api/admin/bundles?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bundles');
      }

      const data = await response.json();
      setBundles(data.bundles);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      console.error('Error fetching bundles:', err);
      setError('Failed to load bundles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchBundles();
  };

  const handleAddBundle = () => {
    router.push('/admin/bundles/new');
  };

  const handleEditBundle = (bundleId: number) => {
    router.push(`/admin/bundles/${bundleId}`);
  };

  const handleDeleteBundle = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token || !bundleToDelete) return;

      const response = await fetch(`/api/admin/bundles/${bundleToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete bundle');
      }

      // Close modal and refresh bundle list
      setShowDeleteModal(false);
      setBundleToDelete(null);
      fetchBundles();
    } catch (err: any) {
      console.error('Error deleting bundle:', err);
      setError(err.message || 'Failed to delete bundle');
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bundle Management</h1>
        <p className="text-gray-500 dark:text-gray-400">View and manage eSIM bundles</p>
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
                placeholder="Search bundles by name"
                value={searchTerm}
                onChange={(e: InputChangeEvent) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
          
          <button
            onClick={handleAddBundle}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary-light"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Bundle
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">ID</th>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Data</th>
                <th scope="col" className="px-6 py-3">Duration</th>
                <th scope="col" className="px-6 py-3">Price (USD)</th>
                <th scope="col" className="px-6 py-3">Countries</th>
                <th scope="col" className="px-6 py-3">Status</th>
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
              ) : bundles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">No bundles found</td>
                </tr>
              ) : (
                bundles.map((bundle) => (
                  <tr key={bundle.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {bundle.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {bundle.name}
                    </td>
                    <td className="px-6 py-4">
                      {bundle.dataAmount} {bundle.dataUnit}
                    </td>
                    <td className="px-6 py-4">
                      {bundle.duration} days
                    </td>
                    <td className="px-6 py-4">
                      {formatCurrency(bundle.price, 'USD')}
                    </td>
                    <td className="px-6 py-4">
                      {bundle._count?.countries || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                        bundle.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {bundle.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center space-x-2">
                      <button
                        onClick={() => handleEditBundle(bundle.id)}
                        className="font-medium text-primary hover:text-primary-dark"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setBundleToDelete(bundle);
                          setShowDeleteModal(true);
                        }}
                        className="font-medium text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
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
            Showing <span className="font-medium">{bundles.length}</span> of <span className="font-medium">{total}</span> bundles
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

      {/* Delete Bundle Modal */}
      {showDeleteModal && bundleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Bundle</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete the bundle <span className="font-medium">{bundleToDelete.name}</span>? 
                This action cannot be undone and may affect existing orders.
              </p>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setBundleToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBundle}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
