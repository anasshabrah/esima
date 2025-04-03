// src/components/OrderItem.tsx

'use client';

import React, { useState } from 'react';
import { Order, ESIMDetailWithQRCode, ModalType } from '@/types/types';
import EsimDetailsModal from '@/components/EsimDetailsModal';
import QRCode from 'react-qr-code';
import {
  FaQrcode,
  FaHistory,
  FaSyncAlt,
  FaList,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { useTranslations } from '@/context/TranslationsContext';
import classNames from 'classnames';
import { getCurrencySymbol } from '@/utils/getCurrencySymbol';

/**
 * Props for OrderItem component.
 */
interface OrderItemProps {
  order: Order;
  userToken: string;
}

/**
 * Order Item Component.
 */
const OrderItem: React.FC<OrderItemProps> = ({ order, userToken }) => {
  const { t, direction } = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedEsim, setSelectedEsim] = useState<ESIMDetailWithQRCode | null>(null);
  const [modalType, setModalType] = useState<ModalType>('details');

  const handleOpenModal = (esim: ESIMDetailWithQRCode, type: ModalType) => {
    setSelectedEsim(esim);
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEsim(null);
  };

  const esims: ESIMDetailWithQRCode[] = order.esims || [];

  // Determine if the layout is RTL
  const isRTL = direction === 'rtl';

  // Get currency symbol based on order currency
  const currencySymbol = getCurrencySymbol(order.currency) || order.currency;

  return (
    <>
      <li className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <h3 className="text-lg sm:text-xl font-bold mb-2">
            {t('customerPage.order.orderNumber', { id: order.id })}
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            <strong>{t('customerPage.order.date')}:</strong>{' '}
            {new Date(order.createdAt).toLocaleString('en-US')}
          </p>
          <p className="text-sm sm:text-base text-gray-600">
            <strong>{t('customerPage.order.country')}:</strong>{' '}
            {order.country?.name || t('customerPage.esimDetailsModal.notAvailable')}
          </p>
          <p className="text-sm sm:text-base text-gray-600">
            <strong>{t('customerPage.order.amountPaid')}:</strong> {order.amount} {currencySymbol}
          </p>
          <div className="text-sm sm:text-base text-gray-600 mt-2">
            <strong>{t('customerPage.order.transactionId')}:</strong>
            <span className={`ml-1 break-all text-gray-800 ${isRTL ? 'mr-1' : ''}`}>
              {order.paymentIntentId}
            </span>
          </div>
        </div>

        {esims.length > 0 ? (
          <div>
            <h4 className="text-md sm:text-lg font-semibold mb-2">{t('customerPage.order.esims')}</h4>
            <ul className="space-y-4">
              {esims.map((esim) => (
                <li key={esim.iccid} className="border p-4 rounded-md">
                  <p className="text-sm sm:text-base break-words">
                    <strong>{t('customerPage.order.iccid')}:</strong> {esim.iccid}
                  </p>
                  <div className="flex flex-col items-center mt-4">
                    {esim.activationCode && (
                      <>
                        <QRCode
                          value={esim.activationCode}
                          size={120}
                          aria-label={t('customerPage.order.scanQrCode')}
                          className="w-40 h-40 sm:w-44 sm:h-44"
                        />
                        <span className="text-xs sm:text-sm text-gray-700 text-center mt-2">
                          {t('customerPage.order.scanQrCode')}
                        </span>
                      </>
                    )}
                    {esim.activationCode && (
                      <a
                        href={`https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${esim.activationCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={classNames(
                          'mt-4 bg-blue-600 text-white py-2 px-4 sm:px-6 rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm sm:text-base',
                          'gap-1',
                          { 'flex-row-reverse': isRTL }
                        )}
                        aria-label={t('customerPage.order.appleQuickInstallAriaLabel', { iccid: esim.iccid })}
                      >
                        <FaQrcode aria-hidden="true" />
                        {t('customerPage.order.quickInstallOnApple')}
                      </a>
                    )}
                  </div>
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 mt-4">
                    <button
                      onClick={() => handleOpenModal(esim, 'history')}
                      className={classNames(
                        'flex items-center justify-center gap-1 bg-green-600 text-white text-xs sm:text-sm py-2 px-3 rounded-md hover:bg-green-700 transition-colors w-full sm:w-auto',
                        { 'flex-row-reverse': isRTL }
                      )}
                      aria-label={t('customerPage.order.getHistoryAriaLabel', { iccid: esim.iccid })}
                    >
                      <FaHistory aria-hidden="true" />
                      {t('customerPage.order.history')}
                    </button>
                    <button
                      onClick={() => handleOpenModal(esim, 'bundles')}
                      className={classNames(
                        'flex items-center justify-center gap-1 bg-purple-600 text-white text-xs sm:text-sm py-2 px-3 rounded-md hover:bg-purple-700 transition-colors w-full sm:w-auto',
                        { 'flex-row-reverse': isRTL }
                      )}
                      aria-label={t('customerPage.order.listBundlesAriaLabel', { iccid: esim.iccid })}
                    >
                      <FaList aria-hidden="true" />
                      {t('customerPage.order.bundles')}
                    </button>
                    <button
                      onClick={() => handleOpenModal(esim, 'location')}
                      className={classNames(
                        'flex items-center justify-center gap-1 bg-yellow-600 text-white text-xs sm:text-sm py-2 px-3 rounded-md hover:bg-yellow-700 transition-colors w-full sm:w-auto',
                        { 'flex-row-reverse': isRTL }
                      )}
                      aria-label={t('customerPage.order.getLocationAriaLabel', { iccid: esim.iccid })}
                    >
                      <FaMapMarkerAlt aria-hidden="true" />
                      {t('customerPage.order.location')}
                    </button>
                    <button
                      onClick={() => handleOpenModal(esim, 'refresh')}
                      className={classNames(
                        'flex items-center justify-center gap-1 bg-red-600 text-white text-xs sm:text-sm py-2 px-3 rounded-md hover:bg-red-700 transition-colors w-full sm:w-auto',
                        { 'flex-row-reverse': isRTL }
                      )}
                      aria-label={t('customerPage.order.refreshEsimAriaLabel', { iccid: esim.iccid })}
                    >
                      <FaSyncAlt aria-hidden="true" />
                      {t('customerPage.order.refresh')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm sm:text-base text-gray-600">{t('customerPage.order.noEsims')}</p>
        )}
      </li>

      {isModalOpen && selectedEsim && (
        <EsimDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          esim={selectedEsim}
          modalType={modalType}
          userToken={userToken}
        />
      )}
    </>
  );
};

export default OrderItem;
