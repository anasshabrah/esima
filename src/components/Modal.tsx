// src/components/Modal.tsx

'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { FaSpinner, FaTimes } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import {
  Bundle,
  Network,
  Coupon,
  SuccessDetails,
  PaymentFormProps,
  PurchaseBundlesResponse,
  RecordOrderResponse,
  ModalProps,
  SendOtpResponse,
  VerifyOtpResponse,
  CreatePaymentIntentResponse,
} from '@/types/types';
import { useCurrency } from '@/context/CurrencyContext';
import EmailVerification from './EmailVerification';
import BundleSelection from './BundleSelection';
import SuccessView from './SuccessView';
import { useTranslations } from '@/context/TranslationsContext';
import { getCountryName } from '@/lib/countryTranslations';
import { convertPrice, formatCurrency } from '@/utils/currencyUtils';

// Dynamic import for PaymentForm to reduce initial load
const DynamicPaymentForm = dynamic<PaymentFormProps>(() => import('./PaymentForm'), {
  loading: () => (
    <div className="flex justify-center items-center h-64">
      <FaSpinner
        className="animate-spin text-primary text-4xl"
        aria-label="Loading Payment Form"
      />
    </div>
  ),
  ssr: false,
});

// Generic safeFetch function with error handling
async function safeFetch<T>(
  url: string,
  options?: RequestInit,
  defaultError?: string
): Promise<{ data?: T; error?: string }> {
  try {
    const response = await fetch(url, options);
    const data: any = await response.json();
    if (!response.ok) {
      const errorMsg = data.error || defaultError || 'An error occurred';
      return { error: errorMsg };
    }
    return { data: data as T };
  } catch (error: any) {
    console.error(`Error fetching ${url}:`, error.message);
    return { error: error.message || defaultError || 'An unknown error occurred' };
  }
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  country,
  initialBundle,
  referralCode,
}) => {
  const { currency, exchangeRate } = useCurrency();
  const { t, language, direction } = useTranslations();

  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<string>(
    initialBundle ? initialBundle.name : ''
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [networkDetails, setNetworkDetails] = useState<Network[]>([]);
  const [paymentView, setPaymentView] = useState<boolean>(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [userOtp, setUserOtp] = useState<string[]>(['', '', '', '']);
  const [otpValid, setOtpValid] = useState<boolean>(false);
  const [otpCountdown, setOtpCountdown] = useState<number>(0);
  const [emailError, setEmailError] = useState<string>('');
  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<boolean>(false);
  const [sendOtpError, setSendOtpError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [successDetails, setSuccessDetails] = useState<SuccessDetails | null>(null);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [couponDetails, setCouponDetails] = useState<Coupon | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /**
   * Verify OTP using the provided handleVerifyOtp function.
   */
  const verifyOtp = useCallback(
    async (otp: string): Promise<boolean> => {
      try {
        const { data, error } = await safeFetch<VerifyOtpResponse>(
          '/api/verify-otp',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
          },
          t('modal.errors.verifyOtpFailed')
        );

        if (error) {
          setOtpError(true);
          // Removed setting the modal-level error
          return false;
        }

        if (data && data.valid) {
          if (data.token) {
            setUserToken(data.token);
          }
          setOtpValid(true);
          setOtpError(false);
          setIsEmailValid(false);
          setOtpSent(false);
          setUserOtp(['', '', '', '']);
          setGeneralError(null);
          return true;
        } else {
          setOtpError(true);
          return false;
        }
      } catch (error: any) {
        setOtpError(true);
        setUserOtp(['', '', '', '']);
        setGeneralError(t('modal.errors.unknownError'));
        return false;
      }
    },
    [email, t]
  );

  const handleSendOtp = useCallback(async () => {
    try {
      const { data, error } = await safeFetch<SendOtpResponse>(
        '/api/send-otp',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
        t('modal.errors.sendOtpFailed')
      );

      if (error) {
        setSendOtpError(error || t('modal.errors.sendOtpFailed'));
        setGeneralError(error || t('modal.errors.sendOtpFailed'));
        return;
      }

      if (data && data.success) {
        setOtpSent(true);
        setOtpCountdown(30);
        setGeneralError(null);
      } else {
        throw new Error(t('modal.errors.sendOtpFailed'));
      }
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : t('modal.errors.sendOtpGeneric');
      setSendOtpError(errorMessage);
      setGeneralError(errorMessage);
    }
  }, [email, t]);

  const handleSendOtpClick = useCallback(async () => {
    setOtpError(false);
    setSendOtpError(null);
    setGeneralError(null);
    await handleSendOtp();
  }, [handleSendOtp]);

  const handleResendOtp = useCallback(async () => {
    setOtpSent(false);
    setUserOtp(['', '', '', '']);
    setOtpError(false);
    setSendOtpError(null);
    setGeneralError(null);
    await handleSendOtpClick();
  }, [handleSendOtpClick]);

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
          setProcessing(true);
          const isValidOtp = await verifyOtp(otp);
          setProcessing(false);
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
    [verifyOtp, userOtp]
  );

  const handleOtpKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
      if (e.key === 'Backspace' && !userOtp[idx] && idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      }
    },
    [userOtp]
  );

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
          verifyOtp(newOtp.join(''));
        }
      }
    },
    [userOtp, verifyOtp]
  );

  const setInputRef = useCallback(
    (el: HTMLInputElement | null, idx: number) => {
      inputRefs.current[idx] = el;
    },
    []
  );

  const handleBuyButtonClick = useCallback(async () => {
    setGeneralError(null);

    if (!selectedBundle) {
      setGeneralError(t('modal.alerts.selectBundle'));
      return;
    }

    if (!otpValid) {
      setGeneralError(t('modal.alerts.otpFailed'));
      return;
    }

    const selectedBundleDetails = bundles.find(
      (bundle) => bundle.name === selectedBundle
    );

    if (!selectedBundleDetails) {
      setGeneralError(t('modal.alerts.invalidBundle'));
      return;
    }

    try {
      setProcessing(true);
      const basePriceUSD = selectedBundleDetails.price || 0;
      let totalAmountUSD = basePriceUSD * quantity;

      // Apply coupon if any
      if (couponDetails?.discountPercent) {
        const discountAmountUSD =
          (totalAmountUSD * couponDetails.discountPercent) / 100;
        totalAmountUSD -= discountAmountUSD;
      }

      // Convert total amount to local currency using exchange rate
      const totalAmountLocal = convertPrice(totalAmountUSD, exchangeRate);
      const roundedTotalAmountLocal = Math.ceil(totalAmountLocal);

      // Create payment intent
      const { data, error } = await safeFetch<CreatePaymentIntentResponse>(
        '/api/create-payment-intent',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: roundedTotalAmountLocal,
            bundleName: selectedBundleDetails.name,
            email,
            quantity,
            currency,
            referralCode,
            ...(couponDetails?.code && { couponCode: couponDetails.code }),
            ...(couponDetails?.discountPercent !== undefined && {
              discountPercent: couponDetails.discountPercent,
            }),
            ...(couponDetails?.sponsor && { couponSponsor: couponDetails.sponsor }),
          }),
        },
        t('modal.alerts.paymentIntentFailed')
      );

      if (error) {
        setGeneralError(error);
        setProcessing(false);
        return;
      }

      const serverClientSecret = data?.clientSecret;
      if (!serverClientSecret) {
        setGeneralError(t('modal.alerts.paymentIntentMissing'));
        setProcessing(false);
        return;
      }

      setClientSecret(serverClientSecret);
      setTotalAmount(roundedTotalAmountLocal);
      setPaymentView(true);
      setProcessing(false);
    } catch (error: any) {
      setGeneralError(t('modal.alerts.paymentProcessingError'));
      setProcessing(false);
    }
  }, [
    selectedBundle,
    bundles,
    quantity,
    couponDetails,
    email,
    exchangeRate,
    currency,
    t,
    otpValid,
    referralCode,
  ]);

  /**
   * Handle successful payment by recording the order.
   * The record-order payload now includes an orderReference field, obtained
   * from the purchase-bundles API response.
   */
  const handlePaymentSuccess = useCallback(async () => {
    setProcessing(true);
    setGeneralError(null);

    const selectedBundleDetails = bundles.find(
      (bundle) => bundle.name === selectedBundle
    );
    if (!selectedBundleDetails) {
      setGeneralError(t('modal.alerts.invalidBundle'));
      setProcessing(false);
      return;
    }

    try {
      // Purchase Bundles
      const { data: purchaseData, error: purchaseError } =
        await safeFetch<PurchaseBundlesResponse>(
          '/api/purchase-bundles',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({
              bundleName: selectedBundleDetails.name,
              quantity,
              assign: true,
              autoApplyBundles: true,
            }),
          },
          t('modal.errors.purchaseFailed')
        );

      if (purchaseError) {
        setGeneralError(purchaseError);
        setProcessing(false);
        return;
      }

      if (!purchaseData?.esims || purchaseData.esims.length === 0) {
        setGeneralError(t('modal.alerts.noEsimsGenerated'));
        setProcessing(false);
        return;
      }

      const missingActivationCodes = purchaseData.esims.filter(
        (esim) => !esim.activationCode
      );
      if (missingActivationCodes.length > 0) {
        setGeneralError(t('modal.alerts.incompleteEsimDetails'));
        setProcessing(false);
        return;
      }

      // Record Order (the server endpoint will send the order email)
      const { data: recordOrderData, error: recordOrderError } =
        await safeFetch<RecordOrderResponse>(
          '/api/record-order',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({
              email,
              bundleName: selectedBundleDetails.name,
              amount: totalAmount,
              currency: currency,
              paymentIntentId: clientSecret || t('modal.labels.notAvailable'),
              country: country.iso,
              quantity,
              referralCode,
              ...(couponDetails?.code && { couponCode: couponDetails.code }),
              ...(couponDetails?.discountPercent !== undefined && {
                discountPercent: couponDetails.discountPercent,
              }),
              ...(couponDetails?.sponsor && { couponSponsor: couponDetails.sponsor }),
              esims: purchaseData.esims.map((esim) => ({
                iccid: esim.iccid,
                smdpAddress: esim.smdpAddress,
                matchingId: esim.matchingId,
                activationCode: esim.activationCode,
                status: esim.status || t('modal.networkDetails.unknown'),
              })),
              // Include the external order reference so the server can retrieve the actual cost.
              orderReference: purchaseData.orderData.orderReference,
            }),
          },
          t('modal.alerts.recordOrderFailed')
        );

      if (recordOrderError) {
        setGeneralError(recordOrderError);
        setProcessing(false);
        return;
      }

      const orderId = recordOrderData?.orderId;
      if (!orderId) {
        setGeneralError(t('modal.alerts.orderIdMissing'));
        setProcessing(false);
        return;
      }

      // Update eSIM Customer Reference
      const iccids = purchaseData.esims.map((esim) => esim.iccid);
      try {
        const { data: updateData, error: updateError } = await safeFetch<{ success: boolean }>(
          '/api/update-esim-customer-ref',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({
              orderId,
              iccids,
            }),
          },
          t('modal.alerts.updateEsimFailed')
        );
        if (updateError) {
          throw new Error(updateError);
        }
      } catch (updateError: any) {
        setGeneralError(t('modal.alerts.updateEsimFailed'));
      }

      setSuccessDetails({
        email,
        bundleDetails: selectedBundleDetails,
        esimDetails: purchaseData.esims,
        countryName: getCountryName(country.iso, language) || country.name,
        orderId,
      });
      setIsSuccess(true);
      setProcessing(false);
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : t('modal.errors.unknownError');
      setGeneralError(`${t('modal.alerts.purchaseProcessError')}: ${errorMessage}`);
      setProcessing(false);
    }
  }, [
    selectedBundle,
    bundles,
    quantity,
    couponDetails,
    email,
    clientSecret,
    country.iso,
    userToken,
    totalAmount,
    currency,
    t,
    language,
    referralCode,
  ]);

  const handleBackToBundleSelection = useCallback(() => {
    setPaymentView(false);
    setClientSecret('');
    setGeneralError(null);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSelectedBundle(initialBundle ? initialBundle.name : '');
      setBundles([]);
      setNetworkDetails([]);
      setPaymentView(false);
      setClientSecret('');
      setEmail('');
      setOtpSent(false);
      setUserOtp(['', '', '', '']);
      setOtpValid(false);
      setOtpCountdown(0);
      setEmailError('');
      setIsEmailValid(false);
      setOtpError(false);
      setSendOtpError(null);
      setLoading(false);
      setFetchError('');
      setProcessing(false);
      setIsSuccess(false);
      setSuccessDetails(null);
      setTotalAmount(0);
      setQuantity(1);
      setCouponDetails(null);
      setUserToken(null);
      setGeneralError(null);
    }
  }, [isOpen, initialBundle]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const fetchCountryData = async () => {
      if (!isOpen) return;
      setLoading(true);
      setFetchError('');
      try {
        const { data, error } = await safeFetch<{ bundles: Bundle[]; networks: Network[] }>(
          `/api/get-country-data?isoCode=${country.iso}`,
          { method: 'GET' },
          t('modal.errors.fetchCountryDataFailed')
        );
        if (error || !data) {
          throw new Error(error || 'No data received from get-country-data API.');
        }
        setBundles(data.bundles || []);
        setNetworkDetails(data.networks || []);
        setGeneralError(null);
      } catch (error: any) {
        setFetchError(error.message || 'An unexpected error occurred.');
        setGeneralError(error.message || t('modal.errors.fetchCountryDataFailed'));
      } finally {
        setLoading(false);
      }
    };
    fetchCountryData();
  }, [isOpen, country, t]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const isRTL = direction === 'rtl';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 pt-3 pb-3 px-2 sm:pt-4 sm:pb-4 sm:px-3"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`bg-white pt-10 pb-2 sm:pt-12 sm:pb-6 px-2 sm:px-4 rounded-lg shadow-lg w-full max-w-lg relative overflow-y-auto max-h-full ${
          isRTL ? 'text-right' : 'text-left'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 ${
            isRTL ? 'left-2' : 'right-2'
          } text-neutral hover:text-accent text-xl sm:text-2xl focus:outline-none focus:ring-2 focus:ring-primary rounded`}
          aria-label={t('modal.close')}
        >
          <FaTimes />
        </button>

        {/* General Error Message */}
        {generalError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded relative">
            <span className="block sm:inline">{generalError}</span>
            <button
              onClick={() => setGeneralError(null)}
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              aria-label={t('modal.closeError') || 'Close Error'}
            >
              <FaTimes />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <FaSpinner
              className="animate-spin text-primary text-4xl"
              aria-label={t('modal.loadingPaymentForm')}
            />
          </div>
        ) : fetchError ? (
          <div className="text-center text-red-500">
            <p className="text-base sm:text-lg">{fetchError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-3 py-2 bg-red-600 text-white rounded text-base sm:text-lg"
              aria-label={t('modal.error.refresh') || 'Refresh'}
            >
              {t('modal.error.refresh') || 'Refresh'}
            </button>
          </div>
        ) : processing ? (
          <div className="flex flex-col items-center justify-center h-64">
            <FaSpinner
              className="animate-spin text-primary text-4xl mb-4"
              aria-label={t('modal.processingPayment')}
            />
            <p className="text-lg sm:text-xl font-medium text-center">
              {t('modal.processingPayment')}
            </p>
          </div>
        ) : isSuccess && successDetails ? (
          <SuccessView successDetails={successDetails} onClose={onClose} />
        ) : (
          <>
            {!otpValid ? (
              <EmailVerification
                email={email}
                setEmail={setEmail}
                emailError={emailError}
                isEmailValid={isEmailValid}
                setIsEmailValid={setIsEmailValid}
                otpSent={otpSent}
                setOtpSent={setOtpSent}
                otpCountdown={otpCountdown}
                setOtpCountdown={setOtpCountdown}
                handleSendOtp={handleSendOtpClick}
                userOtp={userOtp}
                setUserOtp={setUserOtp}
                handleVerifyOtp={verifyOtp}
                otpError={otpError}
                setOtpError={setOtpError}
                sendOtpError={sendOtpError}
                setSendOtpError={setSendOtpError}
              />
            ) : !paymentView ? (
              <BundleSelection
                country={country}
                bundles={bundles}
                selectedBundle={selectedBundle}
                setSelectedBundle={setSelectedBundle}
                quantity={quantity}
                setQuantity={setQuantity}
                handleBuyButtonClick={handleBuyButtonClick}
                loading={loading}
                processing={processing}
                setCouponDetails={setCouponDetails}
                couponDetails={couponDetails}
              />
            ) : (
              clientSecret && (
                <DynamicPaymentForm
                  clientSecret={clientSecret}
                  amount={totalAmount}
                  currency={currency}
                  bundleName={selectedBundle}
                  email={email}
                  quantity={quantity}
                  onPaymentSuccess={handlePaymentSuccess}
                  onBack={handleBackToBundleSelection}
                />
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Modal;
