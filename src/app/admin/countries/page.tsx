'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Globe, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function CountriesPage() {
  const { user: adminUser } = useAdminAuth();
  const router = useRouter();
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState(null);

  useEffect(() => {
    fetchCountries();
  }, [page, limit, searchTerm]);

  const fetchCountries = async () => {
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

      const response = await fetch(`/api/admin/countries?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch countries');
      }

      const data = await response.json();
      setCountries(data.countries);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      console.error('Error fetching countries:', err);
      setError('Failed to load countries. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchCountries();
  };

  const handleAddCountry = () => {
    router.push('/admin/countries/new');
  };

  const handleEditCountry = (countryId) => {
    router.push(`/admin/countries/${countryId}`);
  };

  const handleDeleteCountry = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token || !countryToDelete) return;

      const response = await fetch(`/api/admin/countries/${countryToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete country');
      }

      // Close modal and refresh country list
      setShowDeleteModal(false);
      setCountryToDelete(null);
      fetchCountries();
    } catch (err) {
      console.error('Error deleting country:', err);
      setError(err.message || 'Failed to delete country');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Country Management</h1>
        <p className="text-gray-500 dark:text-gray-400">View and manage countries for eSIM availability</p>
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
                placeholder="Search countries by name or ISO code"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
          
          <button
            onClick={handleAddCountry}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary-light"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Country
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">ID</th>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">ISO Code</th>
                <th scope="col" className="px-6 py-3">Currency</th>
                <th scope="col" className="px-6 py-3">Bundles</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : countries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">No countries found</td>
                </tr>
              ) : (
                countries.map((country) => (
                  <tr key={country.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {country.id}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {country.name}
                    </td>
                    <td className="px-6 py-4">
                      {country.isoCode}
                    </td>
                    <td className="px-6 py-4">
                      {country.currencyCode || 'USD'}
                    </td>
                    <td className="px-6 py-4">
                      {country._count?.bundles || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                        country.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {country.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center space-x-2">
                      <button
                        onClick={() => handleEditCountry(country.id)}
                        className="font-medium text-primary hover:text-primary-dark"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setCountryToDelete(country);
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
            Showing <span className="font-medium">{countries.length}</span> of <span className="font-medium">{total}</span> countries
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

      {/* Delete Country Modal */}
      {showDeleteModal && countryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Country</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete the country <span className="font-medium">{countryToDelete.name}</span>? 
                This action cannot be undone and may affect existing bundles and orders.
              </p>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setCountryToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCountry}
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
