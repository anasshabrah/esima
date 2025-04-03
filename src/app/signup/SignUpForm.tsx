// src/app/signup/SignUpForm.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/context/TranslationsContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ClipLoader } from 'react-spinners';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import classNames from 'classnames';
import CountrySelect from './CountrySelect';
import { countryPhoneCodes } from '@/utils/countryPhoneCodes';
import logger from '@/utils/logger.server';
import { z } from 'zod';

// Define the schema for validating the request body
const signupSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(1, 'Phone number is required.'),
  country: z.string().length(2, 'Country must be a 2-letter ISO code.'), // Ensure it's a 2-letter ISO code
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  referralCode: z.string().optional(),
});

const SignUpForm: React.FC = () => {
  const { t } = useTranslations();
  const router = useRouter();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    password: '',
  });
  const [referralCode, setReferralCode] = useState<string>('');
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [countryCode, setCountryCode] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Capture referralCode from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('referral');
    if (code) {
      setReferralCode(code);
    }
  }, []);

  // Update country code when country changes
  useEffect(() => {
    const phoneCode = countryPhoneCodes[formData.country];
    setCountryCode(phoneCode || '');
  }, [formData.country]);

  // Validation function
  const validate = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {};
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = t('Name is required.');
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      newErrors.name = t('Name must contain only letters and spaces.');
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = t('Email is required.');
      isValid = false;
    } else if (
      !/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(formData.email.trim())
    ) {
      newErrors.email = t('Please enter a valid email address.');
      isValid = false;
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = t('Phone number is required.');
      isValid = false;
    } else if (!/^\d+$/.test(formData.phone.trim())) {
      newErrors.phone = t('Phone number must contain only numbers.');
      isValid = false;
    } else if (formData.phone.trim().startsWith('0')) {
      newErrors.phone = t('Phone number cannot start with 0.');
      isValid = false;
    }

    // Country validation
    if (!formData.country) {
      newErrors.country = t('Please select a country.');
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t('Password is required.');
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = t('Password must be at least 6 characters.');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // If name is 'name', prevent entering numbers and special characters
    if (name === 'name' && /[^A-Za-z\s]/.test(value)) {
      return;
    }

    // If name is 'phone', allow only digits
    if (name === 'phone' && /[^0-9]/.test(value)) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  // Handle country selection
  const handleCountryChange = (countryCode: string) => {
    setFormData((prev) => ({ ...prev, country: countryCode }));
    setErrors((prev) => ({ ...prev, country: undefined }));
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
      const payload = { ...formData, referralCode };
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrors({
          general:
            result.error ||
            t('Email is already registered. Please log in or use the forgot password option.'),
        });
        setLoading(false);
        return;
      }

      login(result.user, result.token);
      router.push('/referral-dashboard');
    } catch (err) {
      setErrors({ general: t('An unexpected error occurred.') });
      setLoading(false);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          {t('Name')}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder={t('Enter your full name')}
          value={formData.name}
          onChange={handleInputChange}
          required
          className={classNames(
            'mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-highlight focus:border-highlight',
            {
              'border-red-500': errors.name,
              'border-gray-300': !errors.name,
            }
          )}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
          autoComplete="name"
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-600" id="name-error">
            {errors.name}
          </p>
        )}
      </div>

      {/* Country Selector */}
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700">
          {t('Country')}
        </label>
        <CountrySelect
          value={formData.country}
          onChange={handleCountryChange}
          error={errors.country}
          ariaDescribedBy="country-error"
        />
        {errors.country && (
          <p className="mt-2 text-sm text-red-600" id="country-error">
            {errors.country}
          </p>
        )}
      </div>

      {/* Phone Field */}
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          {t('Phone')}
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
            {countryCode || t('Code')}
          </span>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder={t('Enter phone number')}
            value={formData.phone}
            onChange={handleInputChange}
            required
            inputMode="numeric"
            pattern="[0-9]*"
            className={classNames(
              'flex-1 block w-full min-w-0 px-4 py-2 border rounded-none rounded-r-md focus:outline-none focus:ring-highlight focus:border-highlight',
              {
                'border-red-500': errors.phone,
                'border-gray-300': !errors.phone,
              }
            )}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            autoComplete="tel"
          />
        </div>
        {errors.phone && (
          <p className="mt-2 text-sm text-red-600" id="phone-error">
            {errors.phone}
          </p>
        )}
      </div>

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
          {t('Password')}
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            placeholder={t('Enter your password')}
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
            autoComplete="new-password"
          />
          {/* Eye Icon Button */}
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 focus:outline-none"
            aria-label={showPassword ? t('Hide password') : t('Show password')}
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
          {loading ? <ClipLoader size={20} color="#ffffff" /> : t('Sign Up')}
        </button>
      </div>

      {/* Links Section */}
      <div className="text-center space-y-2">
        {/* Link to Sign In */}
        <p className="text-sm text-gray-600">
          {t('Already have an account?')}{' '}
          <Link href="/signin" className="font-medium text-highlight hover:text-accent">
            {t('Sign In')}
          </Link>
        </p>
      </div>
    </form>
  );
};

export default SignUpForm;
