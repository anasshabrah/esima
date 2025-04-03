// src/app/forgot-password/ForgotPasswordForm.tsx

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/context/TranslationsContext';
import { useRouter } from 'next/navigation';
import { ClipLoader } from 'react-spinners';
import classNames from 'classnames';

const ForgotPasswordForm: React.FC = () => {
  const { t } = useTranslations();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  // Validation function
  const validate = (): boolean => {
    if (!email.trim()) {
      setError(t('Email is required.'));
      return false;
    } else if (
      !/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email.trim())
    ) {
      setError(t('Please enter a valid email address.'));
      return false;
    }
    setError(null);
    return true;
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
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || t('An error occurred.'));
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError(t('An unexpected error occurred.'));
      setLoading(false);
    }
  };

  return (
    <div>
      {success ? (
        // Success Message
        <div className="bg-green-100 text-green-800 p-4 rounded-md text-center">
          <p>
            {t(
              'If the email you provided is registered, you will receive a password reset link shortly.'
            )}
          </p>
        </div>
      ) : (
        // Forgot Password Form
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {t('Email')}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder={t('you@example.com')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={classNames(
                'mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-highlight focus:border-highlight',
                {
                  'border-red-500': error,
                  'border-gray-300': !error,
                }
              )}
              aria-invalid={!!error}
              aria-describedby={error ? 'email-error' : undefined}
              autoComplete="email"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600" id="email-error">
                {error}
              </p>
            )}
          </div>

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

      {/* Navigation Links */}
      <div className="mt-6 flex flex-col items-center space-y-4">
        {/* Back to Sign In as Text */}
        <Link href="/signin" className="text-sm text-highlight hover:underline">
          {t('Back to Sign In')}
        </Link>

        {/* Link to Sign Up */}
        <Link href="/signup" className="text-center text-sm text-highlight hover:text-accent">
          {t("Don't have an account? Sign Up")}
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
