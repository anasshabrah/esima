'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  Sim, 
  RefreshCw,
  QrCode,
  Download,
  Send,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function EsimDetailsPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { user: adminUser } = useAdminAuth();
  const [esim, setEsim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResendModal, setShowResendModal] = useState(false);
  const [resending, setResending] = useState(false);
  const [showRefreshModal, setShowRefreshModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  useEffect(() => {
    fetchEsimDetails();
  }, [id]);

  const fetchEsimDetails = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`/api/admin/esims/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch eSIM details');
      }

      const data = await response.json();
      setEsim(data.esim);
    } catch (err) {
      console.error('Error fetching eSIM details:', err);
      setError('Failed to load eSIM details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`/api/admin/esims/${id}/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to refresh eSIM status');
      }

      // Close modal and refresh esim details
      setShowRefreshModal(false);
      fetchEsimDetails();
    } catch (err) {
      console.error('Error refreshing eSIM:', err);
      setError(err.message || 'Failed to refresh eSIM status');
    } finally {
      setRefreshing(false);
    }
  };

  const handleResendQR = async () => {
    setResending(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(`/api/admin/esims/${id}/resend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to resend eSIM QR code');
      }

      // Close modal and refresh esim details
      setShowResendModal(false);
      fetchEsimDetails();
    } catch (err) {
      console.error('Error resending eSIM QR code:', err);
      setError(err.message || 'Failed to resend eSIM QR code');
    } finally {
      setResending(false);
    }
  };

  const downloadQrCode = () => {
    if (!esim || !esim.qrCodeUrl) return;
    
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.href = esim.qrCodeUrl;
    a.download = `esim-${esim.id}-qrcode.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
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

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  if (!esim) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">eSIM not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">The eSIM you're looking for doesn't exist or you don't have permission to view it.</p>
        <button
          onClick={() => router.push('/admin/esims')}
          className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary-light"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to eSIMs
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <button
            onClick={() => router.push('/admin/esims')}
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to eSIMs
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">eSIM Details</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowRefreshModal(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </button>
          <button
            onClick={() => setShowResendModal(true)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary-light"
          >
            <Send className="w-4 h-4 mr-2" />
            Resend QR Code
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
            <Sim className="w-5 h-5 mr-2 text-primary" />
            eSIM Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
              <p className="font-medium text-gray-900 dark:text-white">{esim.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">ICCID</p>
              <p className="font-medium text-gray-900 dark:text-white">{esim.iccid || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getStatusBadgeClass(esim.status)}`}>
                {esim.status}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Provider</p>
              <p className="font-medium text-gray-900 dark:text-white">{esim.provider || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Provider Reference</p>
              <p className="font-medium text-gray-900 dark:text-white">{esim.providerReference || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Bundle & Order</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bundle</p>
              <p className="font-medium text-gray-900 dark:text-white">{esim.bundle?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Data</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {esim.bundle ? `${esim.bundle.dataAmount} ${esim.bundle.dataUnit}` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {esim.bundle ? `${esim.bundle.duration} days` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Order ID</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {esim.orderId ? (
                  <a 
                    href={`/admin/orders/${esim.orderId}`}
                    className="text-primary hover:text-primary-dark"
                  >
                    {esim.orderId}
                  </a>
                ) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {esim.user?.email || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Activation Details</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(esim.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Activation Date</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {esim.activationDate ? new Date(esim.activationDate).toLocaleString() : 'Not activated'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Expiry Date</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {esim.expiryDate ? new Date(esim.expiryDate).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(esim.updatedAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">QR Code</p>
              <div className="flex items-center space-x-2 mt-1">
                <button
                  onClick={() => setShowQrCode(true)}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-2 focus:ring-primary-light"
                  disabled={!esim.qrCodeUrl}
                >
                  <QrCode className="w-3 h-3 mr-1" />
                  View
                </button>
                <button
                  onClick={downloadQrCode}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-300"
                  disabled={!esim.qrCodeUrl}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {esim.usageData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Usage Data</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data Usage</h3>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-4 mb-2">
                  <div 
                    className="bg-primary h-4 rounded-full" 
                    style={{ width: `${Math.min(100, (esim.usageData.dataUsed / esim.usageData.dataTotal) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {esim.usageData.dataUsed} MB used of {esim.usageData.dataTotal} MB ({Math.round((esim.usageData.dataUsed / esim.usageData.dataTotal) * 100)}%)
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Remaining</h3>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-4 mb-2">
                  <div 
                    className="bg-blue-500 h-4 rounded-full" 
                    style={{ width: `${Math.min(100, (esim.usageData.daysRemaining / esim.usageData.totalDays) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {esim.usageData.daysRemaining} days remaining of {esim.usageData.totalDays} days
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Connection</h3>
                <p className="text-sm text-gray-900 dark:text-white">
                  {esim.usageData.lastConnectionDate ? new Date(esim.usageData.lastConnectionDate).toLocaleString() : 'Never connected'}
                </p>
                {esim.usageData.lastConnectionCountry && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Last connected in {esim.usageData.lastConnectionCountry}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log */}
      {esim.activityLog && esim.activityLog.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Activity Log</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Event</th>
                  <th scope="col" className="px-6 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {esim.activityLog.map((log, index) => (
                  <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td className="px-6 py-4">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {log.event}
                    </td>
                    <td className="px-6 py-4">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Refresh Status Modal */}
      {showRefreshModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Refresh eSIM Status</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to refresh the status of this eSIM?
                This will query the provider API for the latest status information.
              </p>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowRefreshModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRefreshStatus}
                disabled={refreshing}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {refreshing ? 'Refreshing...' : 'Refresh Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resend QR Code Modal */}
      {showResendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Resend eSIM QR Code</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to resend the QR code for this eSIM to the customer's email?
              </p>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowResendModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResendQR}
                disabled={resending}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? 'Sending...' : 'Resend QR Code'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrCode && esim.qrCodeUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">eSIM QR Code</h3>
            </div>
            <div className="p-4 flex justify-center">
              <img 
                src={esim.qrCodeUrl} 
                alt="eSIM QR Code" 
                className="max-w-full h-auto"
                style={{ maxHeight: '300px' }}
              />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowQrCode(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
              <button
                type="button"
                onClick={downloadQrCode}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary-light"
              >
                <Download className="w-4 h-4 mr-2 inline-block" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
