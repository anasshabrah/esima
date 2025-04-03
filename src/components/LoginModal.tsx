// src/components/LoginModal.tsx

'use client';

import React, { useState } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { useTranslations } from '@/context/TranslationsContext';
import classNames from 'classnames';

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { t, direction } = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/send-login-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(t('loginModal.successMessage'));
      } else {
        setErrorMessage(data.error || t('loginModal.errorOccurred'));
      }
    } catch (error) {
      console.error('Error sending login link:', error);
      setErrorMessage(t('loginModal.errorOccurred'));
    } finally {
      setIsSending(false);
    }
  };

  // Determine if the layout is RTL
  const isRTL = direction === 'rtl';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className={classNames(
            "absolute top-4 text-gray-500 hover:text-accent text-2xl focus:outline-none focus:ring-2 focus:ring-primary rounded",
            {
              'right-4': !isRTL, // Position on the right for LTR
              'left-4': isRTL,    // Position on the left for RTL
              'transform rotate-180': isRTL, // Optionally rotate the '×' icon in RTL
            }
          )}
          aria-label={t('loginModal.close')}
        >
          <FaTimes />
        </button>
        <h2 id="login-modal-title" className="text-2xl font-bold mb-4">
          {t('loginModal.title')}
        </h2>
        {message ? (
          <p className="text-green-600">{message}</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="email"
              className={classNames("block mb-2 font-medium", {
                'text-right': isRTL,
                'text-left': !isRTL,
              })}
            >
              {t('loginModal.emailLabel')}
            </label>
            <input
              type="email"
              id="email"
              dir="ltr" // Explicitly set direction to LTR
              className="w-full p-2 border border-gray-500 rounded-md mb-4 ring-1 text-left"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('loginModal.emailPlaceholder')}
              required
            />
            {errorMessage && (
              <p className="text-red-600 mb-2">{errorMessage}</p>
            )}
            <button
              type="submit"
              className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-highlight transition-colors flex items-center justify-center"
              disabled={isSending}
              aria-label={t('loginModal.sendLoginLink')}
            >
              {isSending ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> {t('loginModal.sending')}
                </>
              ) : (
                t('loginModal.sendLoginLink')
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginModal;