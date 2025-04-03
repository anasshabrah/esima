'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Globe, 
  Plus, 
  Trash2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function BundleDetailsPage({ params }) {
  const { id } = params;
  const isNewBundle = id === 'new';
  const router = useRouter();
  const { user: adminUser } = useAdminAuth();
  const [bundle, setBundle] = useState({
    name: '',
    description: '',
    dataAmount: 0,
    dataUnit: 'GB',
    duration: 0,
    price: 0,
    isActive: true,
    roamingEnabled: false
  });
  const [loading, setLoading] = useState(!isNewBundle);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [countries, setCountries] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);

  useEffect(() => {
    if (!isNewBundle) {
      fetchBundleDetails();
    }
    fetchAllCountries();
  }, [id]);

  const fetchBundleDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`/api/admin/bundles/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bundle details');
      }

      const data = await response.json();
      setBundle(data.bundle);
      
      if (data.bundle.countries) {
        setSelectedCountries(data.bundle.countries);
      }
    } catch (err) {
      console.error('Error fetching bundle details:', err);
      setError('Failed to load bundle details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCountries = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/admin/countries?limit=200', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch countries');
      }

      const data = await response.json();
      setCountries(data.countries);
      setAvailableCountries(data.countries);
    } catch (err) {
      console.error('Error fetching countries:', err);
      setError('Failed to load countries. Please try again later.');
    }
  };

  useEffect(() => {
    // Filter available countries based on selected countries
    if (countries.length > 0 && selectedCountries.length > 0) {
      const selectedIds = selectedCountries.map(c => c.id);
      setAvailableCountries(countries.filter(c => !selectedIds.includes(c.id)));
    } else {
      setAvailableCountries(countries);
    }
  }, [countries, selectedCountries]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBundle({
      ...bundle,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    setBundle({
      ...bundle,
      [name]: value === '' ? '' : Number(value)
    });
  };

  const handleAddCountry = (countryId) => {
    const country = countries.find(c => c.id === parseInt(countryId));
    if (country) {
      setSelectedCountries([...selectedCountries, country]);
    }
  };

  const handleRemoveCountry = (countryId) => {
    setSelectedCountries(selectedCountries.filter(c => c.id !== countryId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      // Validate required fields
      if (!bundle.name || bundle.dataAmount <= 0 || bundle.duration <= 0 || bundle.price <= 0) {
        throw new Error('Please fill in all required fields with valid values');
      }

      const method = isNewBundle ? 'POST' : 'PUT';
      const url = isNewBundle ? '/api/admin/bundles' : `/api/admin/bundles/${id}`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...bundle,
          countries: selectedCountries.map(c => c.id)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save bundle');
      }

      // Redirect to bundles list
      router.push('/admin/bundles');
    } catch (err) {
      console.error('Error saving bundle:', err);
      setError(err.message || 'Failed to save bundle');
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
            onClick={() => router.push('/admin/bundles')}
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Bundles
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {isNewBundle ? 'Create New Bundle' : `Edit Bundle: ${bundle.name}`}
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Bundle'}
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
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Bundle Information</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bundle Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={bundle.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price (USD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={bundle.price}
                    onChange={handleNumberInputChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={bundle.description || ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="dataAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="dataAmount"
                    name="dataAmount"
                    min="0"
                    step="0.1"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={bundle.dataAmount}
                    onChange={handleNumberInputChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="dataUnit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data Unit
                  </label>
                  <select
                    id="dataUnit"
                    name="dataUnit"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={bundle.dataUnit}
                    onChange={handleInputChange}
                  >
                    <option value="MB">MB</option>
                    <option value="GB">GB</option>
                    <option value="TB">TB</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration (days) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    min="1"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={bundle.duration}
                    onChange={handleNumberInputChange}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                    checked={bundle.isActive}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Active
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="roamingEnabled"
                    name="roamingEnabled"
                    className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                    checked={bundle.roamingEnabled}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="roamingEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Roaming Enabled
                  </label>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-primary" />
              Country Availability
            </h2>
            <div className="mb-4">
              <label htmlFor="addCountry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Add Country
              </label>
              <div className="flex">
                <select
                  id="addCountry"
                  className="block w-full rounded-l-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  disabled={availableCountries.length === 0}
                >
                  <option value="">Select a country</option>
                  {availableCountries.map((country) => (
                    <option key={country.id} value={country.id}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const select = document.getElementById('addCountry');
                    if (select.value) {
                      handleAddCountry(select.value);
                      select.value = '';
                    }
                  }}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  disabled={availableCountries.length === 0}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected Countries ({selectedCountries.length})
              </h3>
              {selectedCountries.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No countries selected</p>
              ) : (
                <ul className="space-y-2 max-h-80 overflow-y-auto">
                  {selectedCountries.map((country) => (
                    <li key={country.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{country.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCountry(country.id)}
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
