// src/components/PaymentForm.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions, PaymentIntent } from '@stripe/stripe-js';
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import {
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaArrowRight,
} from 'react-icons/fa';
import logger from '@/utils/logger.client';
import { formatCurrency } from '@/utils/currencyUtils';
import { PaymentFormProps } from '@/types/types';
import { useTranslations } from '@/context/TranslationsContext';
import classNames from 'classnames';

const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublicKey) {
  logger.error('Stripe publishable key is not set');
}

const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

const InnerPaymentForm: React.FC<PaymentFormProps> = ({
  onPaymentSuccess,
  clientSecret,
  amount,
  currency,
  bundleName,
  email,
  quantity,
  onBack,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState<boolean>(false);
  const [formattedAmount, setFormattedAmount] = useState<string>('');
  const { t, direction } = useTranslations();

  const isRTL = direction === 'rtl';

  useEffect(() => {
    try {
      const formatted = formatCurrency(amount, currency);
      setFormattedAmount(formatted);
    } catch (error) {
      logger.error('Error formatting currency', { error });
      setErrorMessage(t('paymentForm.formattingError'));
    }
  }, [amount, currency, t]);

  const handlePaymentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      logger.warn('Stripe or Elements not loaded.');
      setErrorMessage(t('paymentForm.processingUnavailable'));
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          receipt_email: email,
          return_url: window.location.href, // Set your desired return URL
        },
        redirect: 'if_required', // Include this line
      });

      if (result.error) {
        logger.error('Payment confirmation error', { error: result.error });

        // Provide specific error messages based on error codes
        const errorCode = result.error.code;
        if (errorCode === 'payment_intent_authentication_failure') {
          setErrorMessage(t('paymentForm.authenticationFailure'));
        } else if (errorCode === 'card_declined') {
          setErrorMessage(t('paymentForm.cardDeclined'));
        } else if (errorCode === 'incorrect_cvc') {
          setErrorMessage(t('paymentForm.incorrectCVC'));
        } else {
          setErrorMessage(result.error.message || t('paymentForm.unexpectedError'));
        }
      } else if (result.paymentIntent) {
        const paymentIntent = result.paymentIntent as PaymentIntent;
        switch (paymentIntent.status) {
          case 'succeeded':
            setPaymentCompleted(true);
            await onPaymentSuccess();
            break;
          case 'requires_payment_method':
            setErrorMessage(t('paymentForm.paymentFailed'));
            break;
          default:
            setErrorMessage(t('paymentForm.paymentNotCompleted'));
        }
      } else {
        setErrorMessage(t('paymentForm.paymentNotCompleted'));
      }
    } catch (error: any) {
      logger.error('Exception during payment submission', { error: error.message });
      setErrorMessage(t('paymentForm.submissionError'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      className={classNames(
        'relative bg-white rounded-lg flex flex-col p-2 sm:p-4 box-border overflow-y-auto max-h-[80vh]',
        {
          'text-right': isRTL,
          'text-left': !isRTL,
        }
      )}
    >
      {!paymentCompleted ? (
        <form onSubmit={handlePaymentSubmit} className="flex flex-col h-full">
          <div className="flex-grow mb-2 sm:mb-4" dir="ltr">
            <PaymentElement
              options={{
                layout: 'auto',
              }}
              className="w-full"
            />
          </div>
          {errorMessage && (
            <div
              className={classNames(
                'flex items-center bg-red-100 text-red-700 p-2 sm:p-3 rounded-md',
                {
                  'justify-end': isRTL,
                  'justify-start': !isRTL,
                }
              )}
            >
              <FaExclamationTriangle
                className={classNames('mr-2 sm:mr-3', { 'ml-2 sm:ml-3': isRTL })}
                aria-hidden="true"
              />
              <span className="text-sm sm:text-base">{errorMessage}</span>
            </div>
          )}
          <div
            className={classNames(
              'sticky bottom-0 bg-white p-2 sm:p-4 flex flex-col items-stretch gap-2 sm:gap-4',
              {
                'text-right': isRTL,
                'text-left': !isRTL,
              }
            )}
          >
            <div
              className={classNames('flex justify-between items-center', {
                'flex-row-reverse': isRTL,
              })}
            >
              {/* Back Button */}
              <button
                type="button"
                onClick={onBack}
                className={classNames(
                  'bg-gray-500 text-white p-1.5 sm:p-2 rounded-md hover:bg-gray-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500',
                  {
                    'mr-2 sm:mr-3': !isRTL,
                    'ml-2 sm:ml-3': isRTL,
                  }
                )}
                aria-label={t('paymentForm.backButton')}
              >
                {isRTL ? <FaArrowRight size={20} /> : <FaArrowLeft size={20} />}
              </button>

              {/* Pay Button */}
              <button
                type="submit"
                disabled={!stripe || processing}
                className={classNames(
                  'flex-grow flex items-center justify-center bg-green-600 text-white py-1.5 sm:py-2 px-2 sm:px-4 rounded-md hover:bg-green-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500',
                  {
                    'opacity-50 cursor-not-allowed': !stripe || processing,
                  }
                )}
                aria-label={t('paymentForm.payNowWithAmount', { amount: formattedAmount })}
              >
                {processing ? (
                  <>
                    <FaSpinner
                      className={classNames('animate-spin', {
                        'mr-2 sm:mr-3': !isRTL,
                        'ml-2 sm:ml-3': isRTL,
                      })}
                      size={20}
                      aria-hidden="true"
                    />
                    <span className="text-sm sm:text-base">{t('paymentForm.processing')}</span>
                  </>
                ) : (
                  <span className="text-sm sm:text-base">
                    {t('paymentForm.payNowWithAmount', { amount: formattedAmount })}
                  </span>
                )}
              </button>
            </div>
            {/* Notice Text */}
            <div className="bg-green-100 text-green-800 p-2 sm:p-3 rounded-md text-center text-sm sm:text-base">
              {t('paymentForm.oneTimePaymentNotice')}
            </div>
          </div>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-center px-2 sm:px-4">
          <FaCheckCircle className="text-green-500 text-6xl mb-4" aria-hidden="true" />
          <h3 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-2">
            {t('paymentForm.paymentSuccessful')}
          </h3>
          <p className="text-gray-600 text-base sm:text-lg">
            {t('paymentForm.thankYouMessage')}
          </p>
        </div>
      )}
    </div>
  );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  const { clientSecret } = props;
  const { t, direction } = useTranslations();
  const isRTL = direction === 'rtl';

  if (!stripePromise) {
    return (
      <div className="flex items-center justify-center p-2 sm:p-4">
        <p className="text-red-600 text-sm sm:text-base">
          {t('paymentForm.unavailableMessage')}
        </p>
      </div>
    );
  }

  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0d6efd',
        colorBackground: '#ffffff',
      },
    },
  };

  return (
    <div
      className={classNames('px-2 sm:px-4', {
        rtl: isRTL,
        ltr: !isRTL,
      })}
    >
      <Elements stripe={stripePromise} options={options}>
        <InnerPaymentForm {...props} />
      </Elements>
    </div>
  );
};

export default PaymentForm;
