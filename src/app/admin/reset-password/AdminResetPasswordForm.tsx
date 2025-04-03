'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ClipLoader } from 'react-spinners';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import classNames from 'classnames';

const AdminResetPasswordForm: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token]);

  // Validation function
  const validate = (): boolean => {
    if (!password) {
      setError('Password is required.');
      return false;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    
    setError(null);
    return true;
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validate()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'An error occurred.');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
      
      // Redirect to signin page after 3 seconds
      setTimeout(() => {
        router.push('/admin/signin');
      }, 3000);
    } catch (err) {
      setError('An unexpected error occurred.');
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-red-100 text-red-800 p-4 rounded-md text-center">
        <p>Invalid or missing reset token. Please request a new password reset.</p>
        <div className="mt-4">
          <a href="/admin/forgot-password" className="text-primary hover:underline">
            Go to Forgot Password
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      {success ? (
        // Success Message
        <div className="bg-green-100 text-green-800 p-4 rounded-md text-center">
          <p>Your password has been reset successfully!</p>
          <p className="mt-2">Redirecting to sign in page...</p>
        </div>
      ) : (
        // Reset Password Form
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={classNames(
                  'mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-highlight focus:border-highlight pr-10',
                  {
                    'border-red-500': error,
                    'border-gray-300': !error,
                  }
                )}
                aria-invalid={!!error}
              />
              {/* Eye Icon Button */}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={classNames(
                  'mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-highlight focus:border-highlight pr-10',
                  {
                    'border-red-500': error,
                    'border-gray-300': !error,
                  }
                )}
                aria-invalid={!!error}
              />
              {/* Eye Icon Button */}
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 focus:outline-none"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={classNames(
                'w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
                {
                  'bg-primary hover:bg-accent': !loading,
                  'bg-blue-400 cursor-not-allowed': loading,
                }
              )}
            >
              {loading ? <ClipLoader size={20} color="#ffffff" /> : 'Reset Password'}
            </button>
          </div>
        </form>
      )}

      {/* Navigation Links */}
      {!success && (
        <div className="mt-6 flex flex-col items-center space-y-4">
          {/* Back to Sign In as Text */}
          <a href="/admin/signin" className="text-sm text-highlight hover:underline">
            Back to Sign In
          </a>
        </div>
      )}
    </div>
  );
};

export default AdminResetPasswordForm;
