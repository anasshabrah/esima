// src/app/reset-password/ResetPasswordForm.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from '@/context/TranslationsContext';
import { useRouter } from 'next/navigation';
import { ClipLoader } from 'react-spinners';
import classNames from 'classnames';

const ResetPasswordForm: React.FC = () => {
  const { t } = useTranslations();
  const router = useRouter();
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParam = searchParams.get('token') || '';
    setToken(tokenParam);
  }, []);

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  // Validation function
  const validate = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {};
    let isValid = true;

    if (!formData.newPassword) {
      newErrors.newPassword = t('New password is required.');
      isValid = false;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = t('Password must be at least 8 characters.');
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('Please confirm your password.');
      isValid = false;
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = t('Passwords do not match.');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    if (!validate()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: formData.newPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrors({ general: result.error || t('An error occurred.') });
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Redirect to sign-in after a delay
      setTimeout(() => {
        router.push('/signin');
      }, 3000);
    } catch (err) {
      setErrors({ general: t('An unexpected error occurred.') });
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center text-red-500">
        {t('Invalid or missing token.')}
      </div>
    );
  }

  return (
    <div>
      {success ? (
        // Success Message
        <div className="bg-green-100 text-green-800 p-4 rounded-md text-center mb-6">
          <p>
            {t(
              'Password reset successful. You will be redirected to sign in shortly.'
            )}
          </p>
        </div>
      ) : (
        // Reset Password Form
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* New Password Field */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              {t('New Password')}
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder={t('Enter new password')}
              value={formData.newPassword}
              onChange={handleInputChange}
              required
              className={classNames(
                'mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary',
                {
                  'border-red-500': errors.newPassword,
                  'border-gray-300': !errors.newPassword,
                }
              )}
              aria-invalid={!!errors.newPassword}
              aria-describedby={errors.newPassword ? 'new-password-error' : undefined}
              autoComplete="new-password"
            />
            {errors.newPassword && (
              <p className="mt-2 text-sm text-red-600" id="new-password-error">
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              {t('Confirm Password')}
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder={t('Re-enter new password')}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className={classNames(
                'mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary',
                {
                  'border-red-500': errors.confirmPassword,
                  'border-gray-300': !errors.confirmPassword,
                }
              )}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600" id="confirm-password-error">
                {errors.confirmPassword}
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
              {loading ? <ClipLoader size={20} color="#ffffff" /> : t('Reset Password')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ResetPasswordForm;
