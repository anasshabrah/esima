'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  Save, 
  DollarSign, 
  CreditCard as CreditCardIcon,
  Percent,
  Globe,
  Settings
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function PaymentsSettingsPage() {
  const router = useRouter();
  const { user: adminUser } = useAdminAuth();
  const [settings, setSettings] = useState({
    paypal: {
      enabled: false,
      clientId: '',
      clientSecret: '',
      mode: 'sandbox', // or 'live'
    },
    stripe: {
      enabled: false,
      publicKey: '',
      secretKey: '',
      webhookSecret: '',
    },
    general: {
      currency: 'USD',
      taxRate: 0,
      taxIncluded: false,
      allowCoupons: true,
      minOrderAmount: 0,
    },
    crypto: {
      enabled: false,
      provider: 'none', // 'coinbase', 'bitpay', etc.
      apiKey: '',
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/admin/settings/payments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment settings');
      }

      const data = await response.json();
      setSettings(data.settings);
    } catch (err) {
      console.error('Error fetching payment settings:', err);
      setError('Failed to load payment settings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    });
  };

  const handleCheckboxChange = (section, field, checked) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: checked
      }
    });
  };

  const handleNumberChange = (section, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value === '' ? '' : Number(value)
      }
    });
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/admin/settings/payments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ settings })
      });

      if (!response.ok) {
        throw new Error('Failed to save payment settings');
      }

      setSuccess('Payment settings saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving payment settings:', err);
      setError(err.message || 'Failed to save payment settings');
    } finally {
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
            onClick={() => router.push('/admin/settings')}
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark"
          >
            <Settings className="w-4 h-4 mr-1" />
            Back to Settings
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Payment Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Configure payment gateways and options</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
            <li className="mr-2">
              <button
                className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                  activeTab === 'general'
                    ? 'text-primary border-primary dark:text-primary dark:border-primary'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('general')}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                General
              </button>
            </li>
            <li className="mr-2">
              <button
                className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                  activeTab === 'paypal'
                    ? 'text-primary border-primary dark:text-primary dark:border-primary'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('paypal')}
              >
                <CreditCardIcon className="w-4 h-4 mr-2" />
                PayPal
              </button>
            </li>
            <li className="mr-2">
              <button
                className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                  activeTab === 'stripe'
                    ? 'text-primary border-primary dark:text-primary dark:border-primary'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('stripe')}
              >
                <CreditCardIcon className="w-4 h-4 mr-2" />
                Stripe
              </button>
            </li>
            <li>
              <button
                className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                  activeTab === 'crypto'
                    ? 'text-primary border-primary dark:text-primary dark:border-primary'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('crypto')}
              >
                <Globe className="w-4 h-4 mr-2" />
                Cryptocurrency
              </button>
            </li>
          </ul>
        </div>

        <div className="p-6">
          {/* General Payment Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">General Payment Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Default Currency
                  </label>
                  <select
                    id="currency"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.general.currency}
                    onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    id="taxRate"
                    min="0"
                    max="100"
                    step="0.01"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.general.taxRate}
                    onChange={(e) => handleNumberChange('general', 'taxRate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="taxIncluded"
                    className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                    checked={settings.general.taxIncluded}
                    onChange={(e) => handleCheckboxChange('general', 'taxIncluded', e.target.checked)}
                  />
                  <label htmlFor="taxIncluded" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Prices include tax
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allowCoupons"
                    className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                    checked={settings.general.allowCoupons}
                    onChange={(e) => handleCheckboxChange('general', 'allowCoupons', e.target.checked)}
                  />
                  <label htmlFor="allowCoupons" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Allow coupon codes
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="minOrderAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Order Amount
                </label>
                <input
                  type="number"
                  id="minOrderAmount"
                  min="0"
                  step="0.01"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={settings.general.minOrderAmount}
                  onChange={(e) => handleNumberChange('general', 'minOrderAmount', e.target.value)}
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Set to 0 for no minimum order amount
                </p>
              </div>
            </div>
          )}

          {/* PayPal Settings */}
          {activeTab === 'paypal' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">PayPal Settings</h2>
              
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="paypalEnabled"
                  className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                  checked={settings.paypal.enabled}
                  onChange={(e) => handleCheckboxChange('paypal', 'enabled', e.target.checked)}
                />
                <label htmlFor="paypalEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Enable PayPal
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="paypalMode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mode
                  </label>
                  <select
                    id="paypalMode"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.paypal.mode}
                    onChange={(e) => handleInputChange('paypal', 'mode', e.target.value)}
                    disabled={!settings.paypal.enabled}
                  >
                    <option value="sandbox">Sandbox (Testing)</option>
                    <option value="live">Live (Production)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="paypalClientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Client ID
                  </label>
                  <input
                    type="text"
                    id="paypalClientId"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.paypal.clientId}
                    onChange={(e) => handleInputChange('paypal', 'clientId', e.target.value)}
                    disabled={!settings.paypal.enabled}
                  />
                </div>
                <div>
                  <label htmlFor="paypalClientSecret" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Client Secret
                  </label>
                  <input
                    type="password"
                    id="paypalClientSecret"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.paypal.clientSecret}
                    onChange={(e) => handleInputChange('paypal', 'clientSecret', e.target.value)}
                    disabled={!settings.paypal.enabled}
                  />
                </div>
              </div>

              {settings.paypal.enabled && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 dark:bg-blue-900/20 dark:border-blue-700">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        Make sure to set up your PayPal webhook to receive payment notifications. Your webhook URL is:
                      </p>
                      <p className="text-sm font-mono mt-1 text-blue-700 dark:text-blue-400">
                        {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/paypal` : '[Your website URL]/api/webhooks/paypal'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stripe Settings */}
          {activeTab === 'stripe' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Stripe Settings</h2>
              
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="stripeEnabled"
                  className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                  checked={settings.stripe.enabled}
                  onChange={(e) => handleCheckboxChange('stripe', 'enabled', e.target.checked)}
                />
                <label htmlFor="stripeEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Enable Stripe
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="stripePublicKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Publishable Key
                  </label>
                  <input
                    type="text"
                    id="stripePublicKey"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.stripe.publicKey}
                    onChange={(e) => handleInputChange('stripe', 'publicKey', e.target.value)}
                    disabled={!settings.stripe.enabled}
                  />
                </div>
                <div>
                  <label htmlFor="stripeSecretKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Secret Key
                  </label>
                  <input
                    type="password"
                    id="stripeSecretKey"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.stripe.secretKey}
                    onChange={(e) => handleInputChange('stripe', 'secretKey', e.target.value)}
                    disabled={!settings.stripe.enabled}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="stripeWebhookSecret" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Webhook Secret
                </label>
                <input
                  type="password"
                  id="stripeWebhookSecret"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={settings.stripe.webhookSecret}
                  onChange={(e) => handleInputChange('stripe', 'webhookSecret', e.target.value)}
                  disabled={!settings.stripe.enabled}
                />
              </div>

              {settings.stripe.enabled && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 dark:bg-blue-900/20 dark:border-blue-700">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        Make sure to set up your Stripe webhook to receive payment notifications. Your webhook URL is:
                      </p>
                      <p className="text-sm font-mono mt-1 text-blue-700 dark:text-blue-400">
                        {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/stripe` : '[Your website URL]/api/webhooks/stripe'}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
                        Required events: payment_intent.succeeded, payment_intent.payment_failed, checkout.session.completed
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cryptocurrency Settings */}
          {activeTab === 'crypto' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Cryptocurrency Settings</h2>
              
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="cryptoEnabled"
                  className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                  checked={settings.crypto.enabled}
                  onChange={(e) => handleCheckboxChange('crypto', 'enabled', e.target.checked)}
                />
                <label htmlFor="cryptoEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Enable Cryptocurrency Payments
                </label>
              </div>

              <div>
                <label htmlFor="cryptoProvider" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Provider
                </label>
                <select
                  id="cryptoProvider"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={settings.crypto.provider}
                  onChange={(e) => handleInputChange('crypto', 'provider', e.target.value)}
                  disabled={!settings.crypto.enabled}
                >
                  <option value="none">Select a provider</option>
                  <option value="coinbase">Coinbase Commerce</option>
                  <option value="bitpay">BitPay</option>
                </select>
              </div>

              <div>
                <label htmlFor="cryptoApiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  id="cryptoApiKey"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={settings.crypto.apiKey}
                  onChange={(e) => handleInputChange('crypto', 'apiKey', e.target.value)}
                  disabled={!settings.crypto.enabled || settings.crypto.provider === 'none'}
                />
              </div>

              {settings.crypto.enabled && settings.crypto.provider !== 'none' && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 dark:bg-blue-900/20 dark:border-blue-700">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        Make sure to set up your cryptocurrency webhook to receive payment notifications. Your webhook URL is:
                      </p>
                      <p className="text-sm font-mono mt-1 text-blue-700 dark:text-blue-400">
                        {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/crypto/${settings.crypto.provider}` : `[Your website URL]/api/webhooks/crypto/${settings.crypto.provider}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
