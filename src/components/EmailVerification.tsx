// src/components/EmailVerification.tsx

'use client';

import React, {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useRef,
  useCallback,
  useLayoutEffect,
} from 'react';
import { MdOutlineEmail } from 'react-icons/md';
import { FaSpinner, FaPaperPlane } from 'react-icons/fa';
import logger from '@/utils/logger.client';
import { OTPInput } from '@/types/types';
import { useTranslations } from '@/context/TranslationsContext';

interface EmailVerificationProps {
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  emailError: string;
  isEmailValid: boolean;
  setIsEmailValid: Dispatch<SetStateAction<boolean>>;
  otpSent: boolean;
  setOtpSent: Dispatch<SetStateAction<boolean>>;
  otpCountdown: number;
  setOtpCountdown: Dispatch<SetStateAction<number>>;
  handleSendOtp: () => Promise<void>;
  userOtp: OTPInput;
  setUserOtp: Dispatch<SetStateAction<OTPInput>>;
  handleVerifyOtp: (otp: string) => Promise<boolean>;
  otpError: boolean;
  setOtpError: Dispatch<SetStateAction<boolean>>;
  sendOtpError: string | null;
  setSendOtpError: Dispatch<SetStateAction<string | null>>;
}

const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  setEmail,
  emailError,
  isEmailValid,
  setIsEmailValid,
  otpSent,
  setOtpSent,
  otpCountdown,
  setOtpCountdown,
  handleSendOtp,
  userOtp,
  setUserOtp,
  handleVerifyOtp,
  otpError,
  setOtpError,
  sendOtpError,
  setSendOtpError,
}) => {
  const { t, direction } = useTranslations();
  const [localEmailError, setLocalEmailError] = useState(emailError);
  const [emailTouched, setEmailTouched] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  /**
   * Update localEmailError when emailError changes
   */
  useEffect(() => {
    setLocalEmailError(emailError);
  }, [emailError]);

  /**
   * Set a timer for OTP countdown when otpSent is true
   */
  useEffect(() => {
    if (otpSent) {
      const timer = setInterval(() => {
        setOtpCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpSent, setOtpCountdown]);

  /**
   * Focus the first OTP input when otpSent becomes true
   */
  useLayoutEffect(() => {
    if (otpSent) {
      inputRefs.current[0]?.focus();
    }
  }, [otpSent]);

  /**
   * Email Validation Function
   */
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  /**
   * Handle Email Input Change
   */
  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (otpCountdown > 0) return; // Prevent changes during countdown
      const value = e.target.value;
      setEmail(value);
      const valid = validateEmail(value);
      setIsEmailValid(valid);
      if (emailTouched) {
        setLocalEmailError(valid ? '' : t('emailVerification.validation.invalidEmail'));
      }
      if (sendOtpError) {
        setSendOtpError(null);
      }
    },
    [validateEmail, setEmail, setIsEmailValid, emailTouched, sendOtpError, t, otpCountdown]
  );

  /**
   * Handle Email Input Blur
   */
  const handleEmailBlur = useCallback(() => {
    setEmailTouched(true);
    const valid = validateEmail(email);
    setIsEmailValid(valid);
    setLocalEmailError(valid ? '' : t('emailVerification.validation.invalidEmail'));
  }, [email, validateEmail, setIsEmailValid, t]);

  /**
   * Determine Input Border Class Based on Validation
   */
  const getInputBorderClass = useCallback(() => {
    if (!emailTouched && !email) return 'border-primary';
    return isEmailValid ? 'border-green-500' : 'border-red-500';
  }, [emailTouched, email, isEmailValid]);

  /**
   * Handle OTP Input Change
   */
  const handleOtpInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
      const value = e.target.value;
      if (/^\d*$/.test(value)) {
        const newOtp = [...userOtp];
        const previousValue = newOtp[idx];
        newOtp[idx] = value;
        setUserOtp(newOtp);
        if (value && !previousValue && idx < userOtp.length - 1) {
          inputRefs.current[idx + 1]?.focus();
        }
        if (newOtp.every((digit) => digit !== '' && digit.length === 1)) {
          const otp = newOtp.join('');
          setIsVerifyingOtp(true); // Indicate that verification is in progress
          const isValidOtp = await handleVerifyOtp(otp);
          setIsVerifyingOtp(false);
          if (!isValidOtp) {
            setOtpError(true);
            setTimeout(() => {
              setUserOtp(['', '', '', '']);
              inputRefs.current[0]?.focus();
            }, 300);
          } else {
            setOtpError(false);
          }
        } else {
          setOtpError(false);
        }
      }
    },
    [handleVerifyOtp, userOtp, setUserOtp, setOtpError]
  );

  /**
   * Handle OTP Input Key Down (e.g., Backspace)
   */
  const handleOtpKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
      if (e.key === 'Backspace' && !userOtp[idx] && idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      }
    },
    [userOtp]
  );

  /**
   * Handle OTP Paste
   */
  const handleOtpPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>, idx: number) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData('Text').trim();
      if (/^\d+$/.test(pasteData)) {
        const pasteDigits = pasteData.slice(0, 4 - idx).split('');
        const newOtp = [...userOtp];
        pasteDigits.forEach((digit, pasteIdx) => {
          const targetIdx = idx + pasteIdx;
          if (targetIdx < newOtp.length) {
            newOtp[targetIdx] = digit;
            if (inputRefs.current[targetIdx]) {
              inputRefs.current[targetIdx]!.value = digit;
            }
          }
        });
        setUserOtp(newOtp);
        const firstEmptyIndex = newOtp.findIndex((digit) => digit === '');
        if (firstEmptyIndex !== -1) {
          inputRefs.current[firstEmptyIndex]?.focus();
        } else {
          inputRefs.current[newOtp.length - 1]?.focus();
        }
        if (newOtp.every((digit) => digit !== '' && digit.length === 1)) {
          handleVerifyOtp(newOtp.join(''));
        }
      }
    },
    [userOtp, handleVerifyOtp]
  );

  /**
   * Handle Send OTP Button Click
   */
  const handleSendOtpClick = useCallback(async () => {
    setIsSendingOtp(true);
    setOtpError(false);
    setSendOtpError(null);
    try {
      await handleSendOtp();
      setOtpSent(true);
      setOtpCountdown(30);
    } catch (error: any) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t('emailVerification.fallback.message');
      setSendOtpError(errorMessage);
      logger.error(`Error sending OTP: ${errorMessage}`);
    } finally {
      setIsSendingOtp(false);
    }
  }, [handleSendOtp, setOtpSent, setOtpCountdown, t]);

  /**
   * Handle Resend OTP Button Click
   */
  const handleResendOtp = useCallback(async () => {
    setOtpSent(false);
    setUserOtp(['', '', '', '']);
    setOtpError(false);
    setSendOtpError(null);
    await handleSendOtpClick();
  }, [handleSendOtpClick, setUserOtp]);

  /**
   * Determine OTP Input Border Class
   */
  const otpInputBorderClass = otpError ? 'border-red-500' : 'border-primary';
  const otpInputFocusClass =
    'focus:border-primary focus:outline-none transition-colors duration-200';

  /**
   * Set Ref for OTP Inputs
   */
  const setInputRef = useCallback(
    (el: HTMLInputElement | null, idx: number) => {
      inputRefs.current[idx] = el;
    },
    []
  );

  return (
    <section
      className="mb-4 mt-2 px-2 sm:px-6 md:px-8 lg:px-10"
      aria-labelledby="email-verification-heading"
    >
      <h2 id="email-verification-heading" className="sr-only">
        {t('emailVerification.heading')}
      </h2>
      <label
        htmlFor="email"
        className="block mb-3 text-sm sm:text-base font-semibold text-center text-gray-700"
      >
        {t('emailVerification.label.enterEmail')}
      </label>
      <div className="relative">
        <div
          className={`flex items-center border ${getInputBorderClass()} rounded-md p-2 sm:p-2.5 md:p-3 w-full space-x-1 rtl:space-x-reverse`}
        >
          <MdOutlineEmail
            className={`text-primary`}
            size={20}
            aria-hidden="true"
            focusable="false"
          />
          <div className="h-6 w-px bg-gray-300" aria-hidden="true"></div>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleEmailBlur}
            placeholder={t('emailVerification.placeholder.sampleEmail')}
            className={`flex-1 border-none focus:outline-none focus:ring-0 text-primary placeholder-neutral ${
              otpCountdown > 0 ? 'cursor-not-allowed bg-gray-100' : ''
            }`}
            required
            aria-invalid={!isEmailValid}
            aria-describedby="email-error send-otp-error"
            disabled={otpCountdown > 0}
            dir="ltr"
          />
        </div>
        <button
          onClick={handleSendOtpClick}
          className={`mt-4 w-full flex items-center justify-center bg-primary text-white px-4 py-2 rounded-md ${
            !isEmailValid || isSendingOtp || otpCountdown > 0
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-highlight'
          } space-x-1 rtl:space-x-reverse transition-colors duration-300`}
          disabled={!isEmailValid || isSendingOtp || otpCountdown > 0}
          aria-disabled={!isEmailValid || isSendingOtp || otpCountdown > 0}
          aria-label={
            isSendingOtp
              ? t('emailVerification.ariaLabel.sendingCode')
              : otpCountdown > 0
              ? t('emailVerification.ariaLabel.resendIn', { count: otpCountdown })
              : otpSent
              ? t('emailVerification.ariaLabel.resendCode')
              : t('emailVerification.ariaLabel.sendCode')
          }
        >
          {isSendingOtp && (
            <FaSpinner
              className="animate-spin"
              aria-hidden="true"
              focusable="false"
            />
          )}
          {!isSendingOtp && otpCountdown <= 0 && (
            <FaPaperPlane
              className="text-white"
              aria-hidden="true"
              focusable="false"
            />
          )}
          <span>
            {isSendingOtp
              ? t('emailVerification.button.sending')
              : otpCountdown > 0
              ? t('emailVerification.button.resendIn', { count: otpCountdown })
              : otpSent
              ? t('emailVerification.button.resendCode')
              : t('emailVerification.button.sendCode')}
          </span>
        </button>
      </div>
      {localEmailError && (
        <p
          id="email-error"
          className="mt-2 text-xs sm:text-sm text-red-600 text-center"
          aria-live="assertive"
        >
          {localEmailError}
        </p>
      )}
      {sendOtpError && (
        <p
          id="send-otp-error"
          className="mt-2 text-xs sm:text-sm text-red-600 text-center"
          role="alert"
        >
          {sendOtpError}
        </p>
      )}
      {otpSent && (
        <div className="mt-6">
          <label
            htmlFor="otp"
            className="block mb-2 text-sm sm:text-base font-semibold text-center text-gray-700"
          >
            {t('emailVerification.label.enterOtp')}
          </label>
          <div
            className={`flex justify-center space-x-2 sm:space-x-3 mb-4`}
            role="group"
            aria-labelledby="otp-group-label"
            dir="ltr"
          >
            <span id="otp-group-label" className="sr-only">
              {t('emailVerification.ariaLabel.enterOtp')}
            </span>
            {userOtp.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                value={digit}
                onChange={(e) => handleOtpInputChange(e, idx)}
                onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                onPaste={(e) => handleOtpPaste(e, idx)}
                maxLength={1}
                ref={(el) => setInputRef(el, idx)}
                dir="ltr"
                className={`border ${otpInputBorderClass} ${otpInputFocusClass} p-2 w-10 text-center rounded-md transition-colors duration-300 text-foreground bg-white`}
                aria-label={`${t('emailVerification.label.enterOtp')} ${idx + 1}`}
                aria-invalid={otpError}
                autoComplete="one-time-code"
                autoFocus={idx === 0}
              />
            ))}
          </div>
          {otpError && (
            <p
              role="alert"
              className="text-red-500 text-sm text-center mb-2"
            >
              {t('emailVerification.validation.invalidOtp')}
            </p>
          )}
          {isVerifyingOtp && (
            <div className="flex items-center space-x-2 justify-center mb-2">
              <FaSpinner
                className="animate-spin text-primary"
                aria-hidden="true"
                focusable="false"
              />
              <p className="text-primary text-sm">{t('emailVerification.status.verifying')}</p>
            </div>
          )}
          {otpCountdown > 0 && (
            <div className="mt-2 text-sm text-center text-gray-600">
              {t('emailVerification.status.resendIn', { count: otpCountdown })}
            </div>
          )}
          {otpCountdown === 0 && (
            <div className="mt-2 text-sm text-center">
              {t('emailVerification.status.didntReceive')}{' '}
              <button
                onClick={handleResendOtp}
                className="text-primary underline hover:text-primary-dark transition-colors"
                aria-label={t('emailVerification.ariaLabel.resendCode')}
              >
                {t('emailVerification.button.resendCode')}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default EmailVerification;
