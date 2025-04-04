// src/app/admin/countries/[id]/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Globe, 
  Package, 
  Plus, 
  Trash2
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function CountryDetailsPage({ params }) {
  const { id } = params;
  const isNewCountry = id === 'new';
  const router = useRouter();
  const { user: adminUser } = useAdminAuth();
  const [country, setCountry] = useState({
    name: '',
    isoCode: '',
    flagUrl: '',
    currencyCode: 'USD',
    currencySymbol: '$',
    exchangeRate: 1,
    isActive: true
  });
  const [loading, setLoading] = useState(!isNewCountry);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [bundles, setBundles] = useState([]);
  const [selectedBundles, setSelectedBundles] = useState([]);
  const [availableBundles, setAvailableBundles] = useState([]);

  useEffect(() => {
    if (!isNewCountry) {
      fetchCountryDetails();
    }
    fetchAllBundles();
  }, [id]);

  const fetchCountryDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`/api/admin/countries/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch country details');
      }

      const data = await response.json();
      setCountry(data.country);
      
      if (data.country.bundles) {
        setSelectedBundles(data.country.bundles);
      }
    } catch (err) {
      console.error('Error fetching country details:', err);
      setError('Failed to load country details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBundles = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/admin/bundles?limit=200', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bundles');
      }

      const data = await response.json();
      setBundles(data.bundles);
      setAvailableBundles(data.bundles);
    } catch (err) {
      console.error('Error fetching bundles:', err);
      setError('Failed to load bundles. Please try again later.');
    }
  };

  useEffect(() => {
    // Filter available bundles based on selected bundles
    if (bundles.length > 0 && selectedBundles.length > 0) {
      const selectedIds = selectedBundles.map(b => b.id);
      setAvailableBundles(bundles.filter(b => !selectedIds.includes(b.id)));
    } else {
      setAvailableBundles(bundles);
    }
  }, [bundles, selectedBundles]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCountry({
      ...country,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    setCountry({
      ...country,
      [name]: value === '' ? '' : Number(value)
    });
  };

  const handleAddBundle = (bundleId) => {
    const bundle = bundles.find(b => b.id === parseInt(bundleId));
    if (bundle) {
      setSelectedBundles([...selectedBundles, bundle]);
    }
  };

  const handleRemoveBundle = (bundleId) => {
    setSelectedBundles(selectedBundles.filter(b => b.id !== bundleId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      // Validate required fields
      if (!country.name || !country.isoCode) {
        throw new Error('Please fill in all required fields');
      }

      const method = isNewCountry ? 'POST' : 'PUT';
      const url = isNewCountry ? '/api/admin/countries' : `/api/admin/countries/${id}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...country,
          bundles: selectedBundles.map(b => b.id)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save country');
      }

      // Redirect to countries list
      router.push('/admin/countries');
    } catch (err) {
      console.error('Error saving country:', err);
      setError(err.message || 'Failed to save country');
      setSaving(false);
    }
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

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <button
            onClick={() => router.push('/admin/countries')}
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Countries
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {isNewCountry ? 'Create New Country' : `Edit Country: ${country.name}`}
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Country'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Country Information</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Country Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={country.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="isoCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ISO Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="isoCode"
                    name="isoCode"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={country.isoCode}
                    onChange={handleInputChange}
                    required
                    maxLength={2}
                    placeholder="2-letter code (e.g., US)"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="flagUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Flag URL
                </label>
                <input
                  type="text"
                  id="flagUrl"
                  name="flagUrl"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={country.flagUrl || ''}
                  onChange={handleInputChange}
                  placeholder="https://example.com/flags/us.png"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="currencyCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Currency Code
                  </label>
                  <input
                    type="text"
                    id="currencyCode"
                    name="currencyCode"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={country.currencyCode}
                    onChange={handleInputChange}
                    maxLength={3}
                    placeholder="USD"
                  />
                </div>
                <div>
                  <label htmlFor="currencySymbol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    id="currencySymbol"
                    name="currencySymbol"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={country.currencySymbol}
                    onChange={handleInputChange}
                    maxLength={3}
                    placeholder="$"
                  />
                </div>
                <div>
                  <label htmlFor="exchangeRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Exchange Rate (to USD)
                  </label>
                  <input
                    type="number"
                    id="exchangeRate"
                    name="exchangeRate"
                    min="0"
                    step="0.0001"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={country.exchangeRate}
                    onChange={handleNumberInputChange}
                  />
                </div>
              </div>

              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                  checked={country.isActive}
                  onChange={handleInputChange}
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Active
                </label>
              </div>
            </form>
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-primary" />
              Available Bundles
            </h2>
            <div className="mb-4">
              <label htmlFor="addBundle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Add Bundle
              </label>
              <div className="flex">
                <select
                  id="addBundle"
                  className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={availableBundles.length === 0}
                >
                  <option value="">Select a bundle</option>
                  {availableBundles.map((bundle) => (
                    <option key={bundle.id} value={bundle.id}>
                      {bundle.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const select = document.getElementById('addBundle');
                    if (select.value) {
                      handleAddBundle(select.value);
                      select.value = '';
                    }
                  }}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  disabled={availableBundles.length === 0}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected Bundles ({selectedBundles.length})
              </h3>
              {selectedBundles.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No bundles selected</p>
              ) : (
                <ul className="space-y-2 max-h-80 overflow-y-auto">
                  {selectedBundles.map((bundle) => (
                    <li key={bundle.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{bundle.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBundle(bundle.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
