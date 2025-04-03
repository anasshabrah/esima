'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Tag, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Percent
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function CouponsPage() {
  const { user: adminUser } = useAdminAuth();
  const router = useRouter();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    maxUses: 100,
    expiresAt: '',
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, [page, limit, searchTerm]);

  const fetchCoupons = async () => {
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

      const response = await fetch(`/api/admin/coupons?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch coupons');
      }

      const data = await response.json();
      setCoupons(data.coupons);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError('Failed to load coupons. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchCoupons();
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      // Validate required fields
      if (!newCoupon.code || newCoupon.discountValue <= 0) {
        throw new Error('Please fill in all required fields with valid values');
      }

      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newCoupon)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add coupon');
      }

      // Reset form and close modal
      setNewCoupon({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        maxUses: 100,
        expiresAt: '',
        isActive: true
      });
      setShowAddModal(false);
      
      // Refresh coupon list
      fetchCoupons();
    } catch (err) {
      console.error('Error adding coupon:', err);
      setError(err.message || 'Failed to add coupon');
    }
  };

  const handleDeleteCoupon = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token || !couponToDelete) return;

      const response = await fetch(`/api/admin/coupons/${couponToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete coupon');
      }

      // Close modal and refresh coupon list
      setShowDeleteModal(false);
      setCouponToDelete(null);
      fetchCoupons();
    } catch (err) {
      console.error('Error deleting coupon:', err);
      setError(err.message || 'Failed to delete coupon');
    }
  };

  const handleEditCoupon = (couponId) => {
    router.push(`/admin/coupons/${couponId}`);
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'PERCENTAGE') {
      return `${coupon.discountValue}%`;
    } else {
      return `$${coupon.discountValue.toFixed(2)}`;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupon Management</h1>
        <p className="text-gray-500 dark:text-gray-400">View and manage discount coupons</p>
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
                placeholder="Search coupons by code"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary-light"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Coupon
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">ID</th>
                <th scope="col" className="px-6 py-3">Code</th>
                <th scope="col" className="px-6 py-3">Discount</th>
                <th scope="col" className="px-6 py-3">Uses</th>
                <th scope="col" className="px-6 py-3">Max Uses</th>
                <th scope="col" className="px-6 py-3">Expires</th>
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
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">No coupons found</td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {coupon.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {coupon.code}
                    </td>
                    <td className="px-6 py-4">
                      {formatDiscount(coupon)}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.usedCount || 0}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.maxUses || 'Unlimited'}
                    </td>
                    <td className="px-6 py-4">
                      {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                        coupon.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center space-x-2">
                      <button
                        onClick={() => handleEditCoupon(coupon.id)}
                        className="font-medium text-primary hover:text-primary-dark"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setCouponToDelete(coupon);
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
            Showing <span className="font-medium">{coupons.length}</span> of <span className="font-medium">{total}</span> coupons
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

      {/* Add Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Coupon</h3>
            </div>
            <form onSubmit={handleAddCoupon}>
              <div className="p-4 space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Coupon Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="code"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="discountType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discount Type
                  </label>
                  <select
                    id="discountType"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discount Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="discountValue"
                    min="0"
                    step={newCoupon.discountType === 'PERCENTAGE' ? '1' : '0.01'}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="maxUses" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Maximum Uses (0 for unlimited)
                  </label>
                  <input
                    type="number"
                    id="maxUses"
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={newCoupon.maxUses}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Expiration Date (leave empty for no expiration)
                  </label>
                  <input
                    type="date"
                    id="expiresAt"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={newCoupon.expiresAt}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                    checked={newCoupon.isActive}
                    onChange={(e) => setNewCoupon({ ...newCoupon, isActive: e.target.checked })}
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Active
                  </label>
                </div>
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary-light"
                >
                  Add Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Coupon Modal */}
      {showDeleteModal && couponToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Coupon</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete the coupon <span className="font-medium">{couponToDelete.code}</span>? 
                This action cannot be undone.
              </p>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setCouponToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCoupon}
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
