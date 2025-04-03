'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Save, 
  Globe, 
  CreditCard, 
  Mail,
  Server,
  ShieldCheck
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function SettingsPage() {
  const router = useRouter();
  const { user: adminUser } = useAdminAuth();
  const [settings, setSettings] = useState({
    general: {
      siteName: '',
      siteDescription: '',
      contactEmail: '',
      supportEmail: '',
      logoUrl: '',
      faviconUrl: '',
      defaultCurrency: 'USD',
      defaultLanguage: 'en'
    },
    payment: {
      paypalEnabled: false,
      stripeEnabled: false,
      paypalClientId: '',
      stripePublicKey: '',
      stripeSecretKey: '',
      taxRate: 0
    },
    email: {
      smtpHost: '',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      smtpFromEmail: '',
      smtpFromName: ''
    },
    affiliate: {
      affiliateEnabled: false,
      commissionRate: 10,
      minimumWithdrawal: 50,
      paymentMethods: 'PayPal,Bank Transfer'
    },
    security: {
      recaptchaEnabled: false,
      recaptchaSiteKey: '',
      recaptchaSecretKey: '',
      twoFactorAuthEnabled: false
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

      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data.settings);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings. Please try again later.');
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

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ settings })
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setSuccess('Settings saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings');
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Configure global system settings</p>
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
                <Settings className="w-4 h-4 mr-2" />
                General
              </button>
            </li>
            <li className="mr-2">
              <button
                className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                  activeTab === 'payment'
                    ? 'text-primary border-primary dark:text-primary dark:border-primary'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('payment')}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Payment
              </button>
            </li>
            <li className="mr-2">
              <button
                className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                  activeTab === 'email'
                    ? 'text-primary border-primary dark:text-primary dark:border-primary'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('email')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </button>
            </li>
            <li className="mr-2">
              <button
                className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                  activeTab === 'affiliate'
                    ? 'text-primary border-primary dark:text-primary dark:border-primary'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('affiliate')}
              >
                <Globe className="w-4 h-4 mr-2" />
                Affiliate
              </button>
            </li>
            <li>
              <button
                className={`inline-flex items-center p-4 border-b-2 rounded-t-lg ${
                  activeTab === 'security'
                    ? 'text-primary border-primary dark:text-primary dark:border-primary'
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab('security')}
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                Security
              </button>
            </li>
          </ul>
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">General Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Site Name
                  </label>
                  <input
                    type="text"
                    id="siteName"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.general.siteName}
                    onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.general.contactEmail}
                    onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Site Description
                </label>
                <textarea
                  id="siteDescription"
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={settings.general.siteDescription}
                  onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="supportEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Support Email
                  </label>
                  <input
                    type="email"
                    id="supportEmail"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.general.supportEmail}
                    onChange={(e) => handleInputChange('general', 'supportEmail', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="defaultCurrency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Default Currency
                  </label>
                  <select
                    id="defaultCurrency"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.general.defaultCurrency}
                    onChange={(e) => handleInputChange('general', 'defaultCurrency', e.target.value)}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    id="logoUrl"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.general.logoUrl}
                    onChange={(e) => handleInputChange('general', 'logoUrl', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="faviconUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Favicon URL
                  </label>
                  <input
                    type="text"
                    id="faviconUrl"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.general.faviconUrl}
                    onChange={(e) => handleInputChange('general', 'faviconUrl', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="defaultLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Default Language
                </label>
                <select
                  id="defaultLanguage"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={settings.general.defaultLanguage}
                  onChange={(e) => handleInputChange('general', 'defaultLanguage', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                  <option value="ar">Arabic</option>
                </select>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="paypalEnabled"
                    className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                    checked={settings.payment.paypalEnabled}
                    onChange={(e) => handleCheckboxChange('payment', 'paypalEnabled', e.target.checked)}
                  />
                  <label htmlFor="paypalEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Enable PayPal
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="stripeEnabled"
                    className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                    checked={settings.payment.stripeEnabled}
                    onChange={(e) => handleCheckboxChange('payment', 'stripeEnabled', e.target.checked)}
                  />
                  <label htmlFor="stripeEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Enable Stripe
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="paypalClientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    PayPal Client ID
                  </label>
                  <input
                    type="text"
                    id="paypalClientId"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.payment.paypalClientId}
                    onChange={(e) => handleInputChange('payment', 'paypalClientId', e.target.value)}
                    disabled={!settings.payment.paypalEnabled}
                  />
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
                    value={settings.payment.taxRate}
                    onChange={(e) => handleNumberChange('payment', 'taxRate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="stripePublicKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stripe Public Key
                  </label>
                  <input
                    type="text"
                    id="stripePublicKey"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.payment.stripePublicKey}
                    onChange={(e) => handleInputChange('payment', 'stripePublicKey', e.target.value)}
                    disabled={!settings.payment.stripeEnabled}
                  />
                </div>
                <div>
                  <label htmlFor="stripeSecretKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stripe Secret Key
                  </label>
                  <input
                    type="password"
                    id="stripeSecretKey"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.payment.stripeSecretKey}
                    onChange={(e) => handleInputChange('payment', 'stripeSecretKey', e.target.value)}
                    disabled={!settings.payment.stripeEnabled}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Email Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="smtpHost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    id="smtpHost"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.email.smtpHost}
                    onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="smtpPort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    id="smtpPort"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.email.smtpPort}
                    onChange={(e) => handleNumberChange('email', 'smtpPort', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="smtpUser" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    id="smtpUser"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.email.smtpUser}
                    onChange={(e) => handleInputChange('email', 'smtpUser', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="smtpPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    id="smtpPassword"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.email.smtpPassword}
                    onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="smtpFromEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    From Email
                  </label>
                  <input
                    type="email"
                    id="smtpFromEmail"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.email.smtpFromEmail}
                    onChange={(e) => handleInputChange('email', 'smtpFromEmail', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="smtpFromName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    From Name
                  </label>
                  <input
                    type="text"
                    id="smtpFromName"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.email.smtpFromName}
                    onChange={(e) => handleInputChange('email', 'smtpFromName', e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
                  onClick={() => {
                    // This would typically send a test email
                    alert('Test email functionality would be implemented here');
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Test Email
                </button>
              </div>
            </div>
          )}

          {/* Affiliate Settings */}
          {activeTab === 'affiliate' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Affiliate Settings</h2>
              
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="affiliateEnabled"
                  className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                  checked={settings.affiliate.affiliateEnabled}
                  onChange={(e) => handleCheckboxChange('affiliate', 'affiliateEnabled', e.target.checked)}
                />
                <label htmlFor="affiliateEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Enable Affiliate Program
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    id="commissionRate"
                    min="0"
                    max="100"
                    step="0.1"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.affiliate.commissionRate}
                    onChange={(e) => handleNumberChange('affiliate', 'commissionRate', e.target.value)}
                    disabled={!settings.affiliate.affiliateEnabled}
                  />
                </div>
                <div>
                  <label htmlFor="minimumWithdrawal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Minimum Withdrawal Amount
                  </label>
                  <input
                    type="number"
                    id="minimumWithdrawal"
                    min="0"
                    step="0.01"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.affiliate.minimumWithdrawal}
                    onChange={(e) => handleNumberChange('affiliate', 'minimumWithdrawal', e.target.value)}
                    disabled={!settings.affiliate.affiliateEnabled}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="paymentMethods" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Methods (comma-separated)
                </label>
                <input
                  type="text"
                  id="paymentMethods"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={settings.affiliate.paymentMethods}
                  onChange={(e) => handleInputChange('affiliate', 'paymentMethods', e.target.value)}
                  disabled={!settings.affiliate.affiliateEnabled}
                  placeholder="PayPal,Bank Transfer,Crypto"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enter payment methods separated by commas
                </p>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="recaptchaEnabled"
                    className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                    checked={settings.security.recaptchaEnabled}
                    onChange={(e) => handleCheckboxChange('security', 'recaptchaEnabled', e.target.checked)}
                  />
                  <label htmlFor="recaptchaEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Enable reCAPTCHA
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="twoFactorAuthEnabled"
                    className="rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                    checked={settings.security.twoFactorAuthEnabled}
                    onChange={(e) => handleCheckboxChange('security', 'twoFactorAuthEnabled', e.target.checked)}
                  />
                  <label htmlFor="twoFactorAuthEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Enable Two-Factor Authentication
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="recaptchaSiteKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    reCAPTCHA Site Key
                  </label>
                  <input
                    type="text"
                    id="recaptchaSiteKey"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.security.recaptchaSiteKey}
                    onChange={(e) => handleInputChange('security', 'recaptchaSiteKey', e.target.value)}
                    disabled={!settings.security.recaptchaEnabled}
                  />
                </div>
                <div>
                  <label htmlFor="recaptchaSecretKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    reCAPTCHA Secret Key
                  </label>
                  <input
                    type="password"
                    id="recaptchaSecretKey"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={settings.security.recaptchaSecretKey}
                    onChange={(e) => handleInputChange('security', 'recaptchaSecretKey', e.target.value)}
                    disabled={!settings.security.recaptchaEnabled}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
