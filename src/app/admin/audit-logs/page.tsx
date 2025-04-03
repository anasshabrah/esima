'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ClipboardList, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Calendar,
  User,
  AlertTriangle,
  Settings,
  Filter
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { AuditLog, ErrorState, DateRange, InputChangeEvent } from '@/types/admin';

export default function AuditLogsPage() {
  const { user: adminUser } = useAdminAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ErrorState>(null);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    fetchAuditLogs();
  }, [page, limit]);

  const fetchAuditLogs = async () => {
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

      if (actionFilter !== 'all') {
        queryParams.append('action', actionFilter);
      }

      if (userFilter) {
        queryParams.append('userId', userFilter);
      }

      if (dateRange.startDate) {
        queryParams.append('startDate', dateRange.startDate);
      }

      if (dateRange.endDate) {
        queryParams.append('endDate', dateRange.endDate);
      }

      const response = await fetch(`/api/admin/audit-logs?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data = await response.json();
      setLogs(data.logs);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.pages);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load audit logs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchAuditLogs();
  };

  const handleFilterChange = () => {
    setPage(1); // Reset to first page on filter change
    fetchAuditLogs();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setActionFilter('all');
    setUserFilter('');
    setDateRange({
      startDate: '',
      endDate: ''
    });
    setPage(1);
    fetchAuditLogs();
  };

  const getActionBadgeClass = (action: string | undefined) => {
    switch (action?.toUpperCase()) {
      case 'CREATE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'LOGIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'LOGOUT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'ERROR':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
        <p className="text-gray-500 dark:text-gray-400">View system activity and user actions</p>
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
                placeholder="Search logs by action, user, or resource"
                value={searchTerm}
                onChange={(e: InputChangeEvent) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {showFilters && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="actionFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Action Type
                </label>
                <select
                  id="actionFilter"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={actionFilter}
                  onChange={(e: InputChangeEvent) => setActionFilter(e.target.value)}
                >
                  <option value="all">All Actions</option>
                  <option value="CREATE">Create</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                  <option value="LOGIN">Login</option>
                  <option value="LOGOUT">Logout</option>
                  <option value="ERROR">Error</option>
                </select>
              </div>
              <div>
                <label htmlFor="userFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  id="userFilter"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={userFilter}
                  onChange={(e: InputChangeEvent) => setUserFilter(e.target.value)}
                  placeholder="Filter by user ID"
                />
              </div>
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={dateRange.startDate}
                  onChange={(e: InputChangeEvent) => setDateRange({...dateRange, startDate: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={dateRange.endDate}
                  onChange={(e: InputChangeEvent) => setDateRange({...dateRange, endDate: e.target.value})}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Clear Filters
              </button>
              <button
                type="button"
                onClick={handleFilterChange}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary-light"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Timestamp</th>
                <th scope="col" className="px-6 py-3">User</th>
                <th scope="col" className="px-6 py-3">Action</th>
                <th scope="col" className="px-6 py-3">Resource Type</th>
                <th scope="col" className="px-6 py-3">Resource ID</th>
                <th scope="col" className="px-6 py-3">IP Address</th>
                <th scope="col" className="px-6 py-3">Details</th>
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
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">No audit logs found</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="px-6 py-4">
                      {log.user ? (
                        <div className="flex items-center">
                          <span>{log.user.email || log.userId}</span>
                          {log.user.isAdmin && (
                            <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                              Admin
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">System</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getActionBadgeClass(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {log.resourceType || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {log.resourceId || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      {log.ipAddress || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          // This would typically show a modal with details
                          alert(log.details || 'No additional details available');
                        }}
                        className="font-medium text-primary hover:text-primary-dark"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
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
            Showing <span className="font-medium">{logs.length}</span> of <span className="font-medium">{total}</span> logs
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
    </div>
  );
}
