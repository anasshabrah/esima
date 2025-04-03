// src/app/referral-dashboard/PaymentSettings.tsx

'use client';

import React, { useState, useEffect } from 'react';

interface PaymentSettingsProps {
  token: string;
}

const PaymentSettings: React.FC<PaymentSettingsProps> = ({ token }) => {
  const [paymentData, setPaymentData] = useState<any>({
    paypalEmail: '',
    bankName: '',
    swiftCode: '',
    accountNumber: '',
    iban: '',
    abaRoutingNumber: '',
    recipientName: '',
    transferCountry: '',
    transferCity: '',
    transferPhone: '',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function fetchPaymentSettings() {
      try {
        const response = await fetch(`/api/referral-dashboard/payment-settings`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setPaymentData(data);
        } else {
          setError(data.error || 'Failed to fetch payment settings.');
        }
      } catch (error) {
        console.error('Error fetching payment settings:', error);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }
    fetchPaymentSettings();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`/api/referral-dashboard/payment-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage('Payment settings updated successfully.');
      } else {
        setError(result.error || 'Failed to update payment settings.');
      }
    } catch (error) {
      console.error('Error updating payment settings:', error);
      setError('An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 shadow rounded p-6 mb-6">
        <p className="text-gray-600">Loading payment settings...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 shadow rounded p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4 text-primary">Payment Settings</h2>
      {message && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        {/* PayPal Email */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">PayPal Email</label>
          <input
            type="email"
            name="paypalEmail"
            value={paymentData.paypalEmail || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>

        {/* Bank Transfer Details */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-secondary mb-2">Bank Transfer Details</h3>
          {/* Bank Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Bank Name</label>
            <input
              type="text"
              name="bankName"
              value={paymentData.bankName || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          {/* SWIFT/BIC Code */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">SWIFT/BIC Code</label>
            <input
              type="text"
              name="swiftCode"
              value={paymentData.swiftCode || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          {/* Account Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={paymentData.accountNumber || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          {/* IBAN */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">IBAN</label>
            <input
              type="text"
              name="iban"
              value={paymentData.iban || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          {/* ABA Routing Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">ABA Routing Number</label>
            <input
              type="text"
              name="abaRoutingNumber"
              value={paymentData.abaRoutingNumber || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Money Transfer via Offices */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-secondary mb-2">Money Transfer via Offices</h3>
          {/* Recipient Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Recipient Name</label>
            <input
              type="text"
              name="recipientName"
              value={paymentData.recipientName || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          {/* Country */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <input
              type="text"
              name="transferCountry"
              value={paymentData.transferCountry || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          {/* City */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              name="transferCity"
              value={paymentData.transferCity || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          {/* Phone Number */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="text"
              name="transferPhone"
              value={paymentData.transferPhone || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-primary text-white px-6 py-2 rounded hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Payment Settings'}
        </button>
      </form>
    </div>
  );
};

export default PaymentSettings;
