// src/app/admin/signin/AdminSignInForm.tsx

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { ClipLoader } from 'react-spinners';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import classNames from 'classnames';

const AdminSignInForm: React.FC = () => {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Validation function
  const validate = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (
      !/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(formData.email.trim())
    ) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!validate()) {
      setLoading(false);
      return;
    }

    try {
      const payload = { email: formData.email, password: formData.password };
      const response = await fetch('/api/admin/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json();
        setErrors({ general: result.error || 'An error occurred.' });
        setLoading(false);
        return;
      }

      const result = await response.json();
      login(result.admin, result.token);
      router.push('/admin');
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred.' });
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="admin@example.com"
          value={formData.email}
          onChange={handleInputChange}
          required
          className={classNames(
            'mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-highlight focus:border-highlight',
            {
              'border-red-500': errors.email,
              'border-gray-300': !errors.email,
            }
          )}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          autoComplete="email"
        />
        {errors.email && (
          <p className="mt-2 text-sm text-red-600" id="email-error">
            {errors.email}
          </p>
        )}
      </div>

      {/* Password Field with Visibility Toggle */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className={classNames(
              'mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-highlight focus:border-highlight pr-10',
              {
                'border-red-500': errors.password,
                'border-gray-300': !errors.password,
              }
            )}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            autoComplete="current-password"
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
        {errors.password && (
          <p className="mt-2 text-sm text-red-600" id="password-error">
            {errors.password}
          </p>
        )}
      </div>

      {/* General Error Message */}
      {errors.general && (
        <div className="text-center">
          <p className="text-sm text-red-600">{errors.general}</p>
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
          {loading ? <ClipLoader size={20} color="#ffffff" /> : 'Sign In'}
        </button>
      </div>
    </form>
  );
};

export default AdminSignInForm;
