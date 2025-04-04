// src/app/admin/users/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  Edit,
  ChevronLeft,
  ChevronRight,
  Search,
  Shield
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export default function UsersPage() {
  const { user: adminUser } = useAdminAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [userToPromote, setUserToPromote] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    phone: '',
    country: '',
    isAdmin: false
  });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // *** Use the correct admin token key ***
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No admin token found');

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }

      const response = await fetch(`/api/admin/users?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.pages);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchUsers();
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No admin token found');

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add user');
      }

      // Reset form and close modal
      setNewUser({
        email: '',
        name: '',
        phone: '',
        country: '',
        isAdmin: false
      });
      setShowAddModal(false);
      fetchUsers();
    } catch (err: any) {
      console.error('Error adding user:', err);
      setError(err.message);
    }
  };

  const handlePromoteUser = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No admin token found');

      const response = await fetch('/api/admin/promote-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: userToPromote.email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to promote user');
      }

      setShowPromoteModal(false);
      setUserToPromote(null);
      fetchUsers();
    } catch (err: any) {
      console.error('Error promoting user:', err);
      setError(err.message);
    }
  };

  const handleViewUser = (userId: number) => {
    router.push(`/admin/users/${userId}`);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-gray-500 dark:text-gray-400">View and manage user accounts</p>
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
                placeholder="Search users by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:ring-4 focus:ring-primary-light"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">ID</th>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Country</th>
                <th scope="col" className="px-6 py-3">Role</th>
                <th scope="col" className="px-6 py-3">Orders</th>
                <th scope="col" className="px-6 py-3">Created</th>
                <th scope="col" className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" role="status">
                        <span className="sr-only">Loading...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">No users found</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">{user.id}</td>
                    <td className="px-6 py-4">{user.name || '-'}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.country || '-'}</td>
                    <td className="px-6 py-4">
                      {user.isAdmin ? (
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Admin
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">{user._count?.orders || 0}</td>
                    <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 flex items-center space-x-2">
                      <button
                        onClick={() => handleViewUser(user.id)}
                        className="font-medium text-primary hover:text-primary-dark"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {!user.isAdmin && (
                        <button
                          onClick={() => {
                            setUserToPromote(user);
                            setShowPromoteModal(true);
                          }}
                          className="font-medium text-purple-600 hover:text-purple-800"
                          title="Promote to admin"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 flex flex-col sm:flex-row justify-between items-center border-t">
          <div className="text-sm text-gray-700 mb-4 sm:mb-0">
            Showing <span className="font-medium">{users.length}</span> of <span className="font-medium">{total}</span> users
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`p-2 rounded-lg ${page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className={`p-2 rounded-lg ${page === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Add New User</h3>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="p-4 space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    id="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium">Name</label>
                  <input
                    type="text"
                    id="name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium">Phone</label>
                  <input
                    type="text"
                    id="phone"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium">Country</label>
                  <input
                    type="text"
                    id="country"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    value={newUser.country}
                    onChange={(e) => setNewUser({ ...newUser, country: e.target.value })}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAdmin"
                    className="rounded border-gray-300"
                    checked={newUser.isAdmin}
                    onChange={(e) => setNewUser({ ...newUser, isAdmin: e.target.checked })}
                  />
                  <label htmlFor="isAdmin" className="ml-2 text-sm">Admin privileges</label>
                </div>
              </div>
              <div className="p-4 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-primary rounded-lg"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Promote User Modal */}
      {showPromoteModal && userToPromote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Promote User to Admin</h3>
            </div>
            <div className="p-4">
              <p>
                Are you sure you want to promote <span className="font-medium">{userToPromote.email}</span> to admin? This will grant full access.
              </p>
            </div>
            <div className="p-4 border-t flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowPromoteModal(false);
                  setUserToPromote(null);
                }}
                className="px-4 py-2 text-sm bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePromoteUser}
                className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg"
              >
                Promote to Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
