// src/app/referral-dashboard/PayoutRequest.tsx

'use client';

import React, { useState } from 'react';

interface PayoutRequestProps {
  token: string;
  totalProfit: number;
  totalWithdrawn: number;
}

const PayoutRequest: React.FC<PayoutRequestProps> = ({
  token,
  totalProfit,
  totalWithdrawn,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('PayPal');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);

  const availableBalance = totalProfit - totalWithdrawn;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber < 50) {
      setError('Minimum withdrawal amount is $50.');
      return;
    }
    if (amountNumber > availableBalance) {
      setError('Amount exceeds available balance.');
      return;
    }
    setProcessing(true);
    try {
      const response = await fetch(`/api/referral-dashboard/payout-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: amountNumber, paymentMethod }),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage('Payout request submitted successfully.');
        setAmount('');
      } else {
        setError(result.error || 'Failed to submit payout request.');
      }
    } catch (error) {
      console.error('Error submitting payout request:', error);
      setError('An unexpected error occurred.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-gray-50 shadow rounded p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4 text-primary">Request Payout</h2>
      <p className="mb-4 text-gray-600">
        Your available balance is{' '}
        <strong>${isNaN(availableBalance) ? '0.00' : availableBalance.toFixed(2)}</strong>
      </p>
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
        {/* Amount */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
          <input
            type="number"
            name="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-primary focus:border-primary"
            min={50}
            max={availableBalance}
            step="0.01"
            required
          />
        </div>
        {/* Payment Method */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Payment Method</label>
          <select
            name="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-primary focus:border-primary"
          >
            <option value="PayPal">PayPal</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Money Transfer">Money Transfer via Offices</option>
          </select>
        </div>
        {/* Submit Button */}
        <button
          type="submit"
          className="bg-primary text-white px-6 py-2 rounded hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          disabled={processing}
        >
          {processing ? 'Processing...' : 'Submit Payout Request'}
        </button>
      </form>
    </div>
  );
};

export default PayoutRequest;
