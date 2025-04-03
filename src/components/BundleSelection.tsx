// src/components/BundleSelection.tsx

import React, { useState, useCallback, useMemo } from 'react';
import {
  FaSpinner,
  FaInternetExplorer,
  FaRegClock,
  FaDollarSign,
} from 'react-icons/fa';
import { MdOutlineSpeed } from 'react-icons/md';
import { Bundle, Country, Coupon } from '@/types/types';
import { useCurrency } from '@/context/CurrencyContext';
import { convertPrice, formatCurrency } from '@/utils/currencyUtils';
import logger from '@/utils/logger.client';
import { useTranslations } from '@/context/TranslationsContext';
import Image from 'next/image';
import { formatBundleName } from '@/utils/bundleUtils';

const LABEL_FONT_SIZE = 'text-sm sm:text-base';
const VALUE_FONT_SIZE = 'text-lg sm:text-xl';
const ICON_SIZE = 28;

interface IconTextProps {
  Icon: React.ComponentType<{
    className?: string;
    size?: number;
    'aria-hidden'?: boolean;
  }>;
  label: string;
  value: string;
}

const IconText: React.FC<IconTextProps> = React.memo(({ Icon, label, value }) => (
  <div className="flex items-center gap-2 sm:gap-4 rtl:gap-x-reverse">
    <Icon className="text-white" size={ICON_SIZE} aria-hidden />
    <div className="flex flex-col">
      <span className={`${LABEL_FONT_SIZE} font-medium text-white opacity-90`}>{label}</span>
      <span className={`${VALUE_FONT_SIZE} font-semibold text-white`}>{value}</span>
    </div>
  </div>
));

interface EnhancedBundleDetailsProps {
  bundleDetails: Bundle;
}

const EnhancedBundleDetails: React.FC<EnhancedBundleDetailsProps> = React.memo(({ bundleDetails }) => {
  const { currency, exchangeRate } = useCurrency();
  const { t, language } = useTranslations();

  const convertedPrice = useMemo(
    () => convertPrice(bundleDetails.price ?? 0, exchangeRate),
    [bundleDetails.price, exchangeRate]
  );

  const formattedPrice = useMemo(
    () => formatCurrency(convertedPrice, currency),
    [convertedPrice, currency]
  );

  const getDurationText = useCallback(() => {
    const count = bundleDetails.duration;
    return t(count === 1 ? 'bundleSelection_daySingular' : 'bundleSelection_dayPlural', { count });
  }, [bundleDetails.duration, t]);

  const dataAmount = useMemo(() => {
    if (bundleDetails.dataAmount == null) return t('bundleSelection_dataAmount_NA');
    if (bundleDetails.dataAmount > 0) {
      const gb = bundleDetails.dataAmount / 1000;
      return gb % 1 === 0 ? `${gb} GB` : `${gb.toFixed(1)} GB`;
    }
    return t('bundleSelection_unlimited');
  }, [bundleDetails.dataAmount, t]);

  const duration = useMemo(
    () => getDurationText(),
    [getDurationText]
  );

  const maxSpeed = useMemo(() => bundleDetails.speed ?? t('bundleSelection_maxSpeed_NA'), [bundleDetails.speed, t]);

  const displayName = bundleDetails.friendlyName ?? bundleDetails.name;

  return (
    <div
      className="relative rounded-lg p-2 sm:p-4 mt-2 sm:mt-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${bundleDetails.imageUrl})` }}
    >
      <div className="absolute inset-0 bg-black opacity-50 rounded-lg"></div>
      <div className="relative text-foreground">
        <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-white">{displayName}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          <IconText Icon={FaInternetExplorer} label={t('bundleSelection_data')} value={dataAmount} />
          <IconText Icon={FaRegClock} label={t('bundleSelection_duration')} value={duration} />
          <IconText Icon={MdOutlineSpeed} label={t('bundleSelection_maxSpeed')} value={maxSpeed} />
          <IconText Icon={FaDollarSign} label={t('bundleSelection_price')} value={formattedPrice} />
        </div>
      </div>
    </div>
  );
});

interface BundleSelectionProps {
  country: Country;
  bundles: Bundle[];
  selectedBundle: string;
  setSelectedBundle: (bundleName: string) => void;
  quantity: number;
  setQuantity: (quantity: number) => void;
  handleBuyButtonClick: () => void;
  loading: boolean;
  processing: boolean;
  setCouponDetails: (coupon: Coupon | null) => void;
  couponDetails: Coupon | null;
}

const BundleSelection: React.FC<BundleSelectionProps> = ({
  country,
  bundles,
  selectedBundle,
  setSelectedBundle,
  quantity,
  setQuantity,
  handleBuyButtonClick,
  loading,
  processing,
  setCouponDetails,
  couponDetails,
}) => {
  const { currency, exchangeRate } = useCurrency();
  const { t, language, direction } = useTranslations();
  const [couponCode, setCouponCode] = useState<string>(couponDetails?.code || '');
  const [couponError, setCouponError] = useState<string>('');

  const selectedBundleDetails = useMemo(() => {
    if (!Array.isArray(bundles)) {
      logger.warn('bundles is not an array:', bundles);
      return null;
    }
    return bundles.find(bundle => bundle.name === selectedBundle) || null;
  }, [bundles, selectedBundle]);

  const totalPrice = useMemo(() => {
    if (!selectedBundleDetails?.price) return 0;
    let price = convertPrice(selectedBundleDetails.price, exchangeRate) * quantity; // Use actual exchangeRate
    if (couponDetails?.discountPercent) {
      price -= (price * couponDetails.discountPercent) / 100;
    }
    return Math.ceil(price);
  }, [selectedBundleDetails, quantity, couponDetails, exchangeRate]);

  const formattedTotalPrice = useMemo(
    () => formatCurrency(totalPrice, currency),
    [totalPrice, currency]
  );

  const handleBuyClick = useCallback(() => {
    if (!selectedBundle) {
      alert(t('bundleSelection_selectBundleAlert'));
      return;
    }
    handleBuyButtonClick();
  }, [selectedBundle, handleBuyButtonClick, t]);

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      setCouponError(t('bundleSelection_couponError_empty'));
      return;
    }

    const cleanedCouponCode = couponCode.trim().toUpperCase();

    try {
      setCouponError('');
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: cleanedCouponCode }),
      });

      if (!response.ok) {
        const data = await response.json();
        setCouponError(data.error || t('bundleSelection_couponError_invalid'));
        setCouponDetails(null);
        return;
      }

      const data = await response.json();
      const coupon: Coupon = {
        id: data.coupon.id,
        code: data.coupon.code,
        discountPercent: data.coupon.discountPercent,
        sponsor: data.coupon.sponsor || undefined,
        validFrom: data.coupon.validFrom ? new Date(data.coupon.validFrom) : undefined,
        validUntil: data.coupon.validUntil ? new Date(data.coupon.validUntil) : undefined,
        createdAt: new Date(data.coupon.createdAt),
        updatedAt: new Date(data.coupon.updatedAt),
      };

      setCouponDetails(coupon);
      setCouponError('');
      setCouponCode(cleanedCouponCode);
      logger.warn('Coupon applied successfully', { couponCode: cleanedCouponCode });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : t('bundleSelection_couponError_validation');
      logger.error('Error validating coupon', {
        couponCode: cleanedCouponCode,
        error: errorMessage,
      });
      setCouponError(t('bundleSelection_couponError_validation'));
      setCouponDetails(null);
    }
  }, [couponCode, setCouponDetails, t]);

  const handleRemoveCoupon = useCallback(() => {
    setCouponDetails(null);
    setCouponCode('');
    setCouponError('');
    logger.warn('Coupon removed');
  }, [setCouponDetails]);

  const processedBundles = useMemo(() => {
    const mappedBundles = bundles.map((bundle) => {
      const displayName = bundle.friendlyName ?? bundle.name;
      const convertedPrice = convertPrice(bundle.price ?? 0, exchangeRate);
      const formattedPrice = formatCurrency(convertedPrice, currency);
      return {
        ...bundle,
        displayName: `${displayName} - ${formattedPrice}`,
        convertedPrice,
      };
    });

    mappedBundles.sort((a, b) => a.convertedPrice - b.convertedPrice);

    return mappedBundles.map(({ convertedPrice, ...rest }) => rest);
  }, [bundles, currency, exchangeRate]);

  const isRTL = direction === 'rtl';

  return (
    <div className="max-w-3xl mx-auto p-2 sm:p-4 bg-white rounded-lg">
      <div className={`flex items-center justify-center mb-2 sm:mb-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
        <Image
          src={`/flags/${country.iso.toUpperCase() || 'DEFAULT'}.svg`}
          alt={t('bundleSelection_flagAlt', { countryName: country.name })}
          width={40}
          height={40}
          className={`mr-2 sm:mr-4 ${isRTL ? 'ml-2 sm:ml-4' : 'mr-2 sm:mr-4'}`}
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.onerror = null;
            target.src = '/flags/default.svg';
          }}
        />
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
          {country.name}
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center my-2 sm:my-4">
          <FaSpinner className="animate-spin text-primary text-2xl" aria-hidden />
        </div>
      ) : processedBundles.length > 0 ? (
        <>
          <div className="mb-2 sm:mb-4">
            <label
              htmlFor="bundleSelect"
              className="block mb-1 sm:mb-2 text-base sm:text-lg font-medium text-foreground"
            >
              {t('bundleSelection_selectBundleLabel')}
            </label>
            <div className="relative">
              <select
                id="bundleSelect"
                className={`w-full px-2 sm:px-4 py-2 sm:py-3 ${isRTL ? 'pl-8 sm:pl-10' : 'pr-8 sm:pr-10'} border border-primary rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-base text-foreground bg-white appearance-none`}
                value={selectedBundle}
                onChange={(e) => setSelectedBundle(e.target.value)}
                aria-label={t('bundleSelection_selectBundleAriaLabel')}
              >
                <option value="">{t('bundleSelection_selectBundlePlaceholder')}</option>
                {processedBundles.map((bundle) => (
                  <option key={bundle.id} value={bundle.name}>
                    {formatBundleName(bundle, language)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedBundleDetails && (
            <EnhancedBundleDetails
              bundleDetails={selectedBundleDetails}
            />
          )}

          <div className="mb-4 sm:mb-6 pt-2 sm:pt-4">
            <div className="relative">
              <label htmlFor="couponCode" className="sr-only">
                {t('bundleSelection_couponCode')}
              </label>
              <input
                id="couponCode"
                type="text"
                className={`w-full px-2 sm:px-4 py-2 sm:py-3 border border-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-base text-foreground bg-white uppercase ${isRTL ? 'text-right' : 'text-left'}`}
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                aria-label={t('bundleSelection_couponCode')}
                placeholder={t('bundleSelection_enterCouponCode')}
                disabled={!!couponDetails}
              />
              {!couponDetails ? (
                <button
                  onClick={handleApplyCoupon}
                  className={`absolute inset-y-0 ${isRTL ? 'left-0' : 'right-0'} px-2 sm:px-4 py-1 sm:py-2 m-1 bg-primary text-white rounded-md hover:bg-highlight transition-colors`}
                  aria-label={t('bundleSelection_applyCouponAriaLabel')}
                >
                  {t('bundleSelection_apply')}
                </button>
              ) : (
                <button
                  onClick={handleRemoveCoupon}
                  className={`absolute inset-y-0 ${isRTL ? 'left-0' : 'right-0'} px-2 sm:px-4 py-1 sm:py-2 m-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors`}
                  aria-label={t('bundleSelection_removeCouponAriaLabel')}
                >
                  {t('bundleSelection_remove')}
                </button>
              )}
            </div>
            {couponError && (
              <p className="mt-1 sm:mt-2 text-sm text-red-600 text-center rtl:text-right" role="alert">
                {couponError}
              </p>
            )}
            {couponDetails && (
              <p className="mt-1 sm:mt-2 text-sm text-green-600 text-center rtl:text-right" role="status">
                {t('bundleSelection_couponSuccess', { discount: couponDetails.discountPercent })}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center mt-2 sm:mt-4 space-y-2 sm:space-y-0 sm:space-x-2 sm:space-x-4 rtl:space-x-reverse">
            {/* Quantity Selector with Integrated Label */}
            <div className="w-full sm:w-1/3 flex items-center border border-gray-300 rounded-md overflow-hidden">
              <span className="px-2 sm:px-3 py-2 sm:py-3 text-sm font-medium text-gray-700 bg-gray-100">
                {t('bundleSelection_quantity')}
              </span>
              <select
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                className="flex-1 text-center border-0 bg-white focus:ring-0 appearance-none px-2 sm:px-4"
                aria-label={t('bundleSelection_selectQuantityAriaLabel')}
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none',
                }}
              >
                {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyClick}
              className={`w-full sm:w-2/3 flex items-center justify-center bg-primary text-white py-2 sm:py-3 px-2 sm:px-4 rounded-md hover:bg-highlight transition-colors text-base sm:text-lg font-semibold ${!selectedBundle || loading || processing ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!selectedBundle || loading || processing}
              aria-disabled={!selectedBundle || loading || processing}
              aria-label={t('bundleSelection_buyNow')}
            >
              {processing ? (
                <>
                  <FaSpinner
                    className="animate-spin mr-2 rtl:ml-2 rtl:mr-0"
                    size={20}
                    aria-hidden="true"
                  />
                  {t('bundleSelection_processing')}
                </>
              ) : (
                `${t('bundleSelection_buyNow')} (${formattedTotalPrice})`
              )}
            </button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500 text-lg">
          {t('bundleSelection_noBundlesAvailable')}
        </p>
      )}
    </div>
  );
};

export default BundleSelection;
