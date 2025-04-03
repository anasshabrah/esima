// src/app/referral-dashboard/WithdrawalHistory.tsx

'use client';

import React, { useState, useEffect } from 'react';

interface WithdrawalHistoryProps {
  token: string;
}

interface Withdrawal {
  id: number;
  amount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

const WithdrawalHistory: React.FC<WithdrawalHistoryProps> = ({ token }) => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    async function fetchWithdrawalHistory() {
      try {
        const response = await fetch(`/api/referral-dashboard/withdrawal-history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setWithdrawals(data);
        } else {
          setError(data.error || 'Failed to fetch withdrawal history.');
        }
      } catch (error) {
        console.error('Error fetching withdrawal history:', error);
        setError('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }
    fetchWithdrawalHistory();
  }, [token]);

  if (loading) {
    return (
      <div className="bg-gray-50 shadow rounded p-6 mb-6">
        <p className="text-gray-600">Loading withdrawal history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 shadow rounded p-6 mb-6">
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 shadow rounded p-6 mb-6">
      <h2 className="text-2xl font-semibold mb-4 text-primary">Withdrawal History</h2>
      {withdrawals.length === 0 ? (
        <p className="text-gray-600">No withdrawals yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Date of Request
                </th>
                <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="py-3 px-4 border-b text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="bg-white">
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {new Date(withdrawal.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    ${withdrawal.amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {withdrawal.paymentMethod}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {withdrawal.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WithdrawalHistory;
