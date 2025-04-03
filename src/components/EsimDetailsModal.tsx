'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { FaSpinner, FaTimes } from 'react-icons/fa';
import { useTranslations } from '@/context/TranslationsContext';
import classNames from 'classnames';
import {
  ESIMDetailWithQRCode,
  ModalType,
  EsimResponse,
  EsimDetailsResponse,
  EsimHistoryResponse,
  EsimBundlesResponse,
  EsimLocationResponse,
  EsimRefreshResponse,
  EsimHistoryEvent,
  EsimBundle,
  EsimBundleAssignment,
} from '@/types/types';

/**
 * Props for EsimDetailsModal component.
 */
interface EsimDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  esim: ESIMDetailWithQRCode;
  modalType: ModalType;
  userToken: string;
}

/**
 * Helper function to format data amounts.
 */
const formatDataAmount = (bytes: number): string => {
  if (bytes >= 1e9) {
    return `${(bytes / 1e9).toFixed(2)} GB`;
  } else if (bytes >= 1e6) {
    return `${(bytes / 1e6).toFixed(2)} MB`;
  } else if (bytes >= 1e3) {
    return `${(bytes / 1e3).toFixed(2)} KB`;
  } else {
    return `${bytes} Bytes`;
  }
};

/**
 * Helper function to calculate percentage.
 */
const calculatePercentage = (remaining: number, initial: number): number => {
  if (initial === 0) return 0;
  return (remaining / initial) * 100;
};

/**
 * eSIM Details Modal Component.
 */
const EsimDetailsModal: React.FC<EsimDetailsModalProps> = ({
  isOpen,
  onClose,
  esim,
  modalType,
  userToken,
}) => {
  const { t, direction } = useTranslations();
  const isRTL = direction === 'rtl';
  const [data, setData] = useState<EsimResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | undefined>(undefined);

  /**
   * Formats a date string or returns a default message.
   */
  const formatDateOrDefault = (dateString: string | null | undefined): string => {
    if (!dateString || dateString === 'N/A')
      return t('customerPage.esimDetailsModal.notActivatedYet');
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t('customerPage.esimDetailsModal.notActivatedYet');
    return date.toLocaleString();
  };

  /**
   * Removes trailing colon from labels.
   */
  const removeTrailingColon = (label: string): string => label.replace(/:$/, '');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(undefined);
      setData(null);
      try {
        let apiUrl = '';
        switch (modalType) {
          case 'details':
            apiUrl = `/api/get-esim-details?iccid=${encodeURIComponent(esim.iccid)}`;
            break;
          case 'history':
            apiUrl = `/api/get-esim-history?iccid=${encodeURIComponent(esim.iccid)}`;
            break;
          case 'bundles':
            apiUrl = `/api/list-esim-bundles?iccid=${encodeURIComponent(esim.iccid)}`;
            break;
          case 'location':
            apiUrl = `/api/get-esim-location?iccid=${encodeURIComponent(esim.iccid)}`;
            break;
          case 'refresh':
            apiUrl = `/api/refresh-esim?iccid=${encodeURIComponent(esim.iccid)}`;
            break;
          default:
            throw new Error(t('customerPage.esimDetailsModal.invalidModalType'));
        }

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || t('customerPage.esimDetailsModal.fetchDataError'));
        }

        const responseData = await response.json();

        // For 'refresh' modalType, use the expected success message
        if (modalType === 'refresh' && responseData.message !== 'Successfully refreshed SIM') {
          responseData.message = 'Successfully refreshed SIM';
        }

        setData(responseData);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('customerPage.esimDetailsModal.unknownError'));
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    } else {
      setData(null);
      setError(undefined);
      setLoading(false);
    }
  }, [isOpen, modalType, esim.iccid, userToken, t]);

  if (!isOpen) return null;

  let title = '';
  switch (modalType) {
    case 'details':
      title = t('customerPage.esimDetailsModal.title.details');
      break;
    case 'history':
      title = t('customerPage.esimDetailsModal.title.history');
      break;
    case 'bundles':
      title = t('customerPage.esimDetailsModal.title.bundles');
      break;
    case 'location':
      title = t('customerPage.esimDetailsModal.title.location');
      break;
    case 'refresh':
      title = t('customerPage.esimDetailsModal.title.refresh');
      break;
    default:
      title = t('customerPage.esimDetailsModal.title.default');
  }

  // Type guards for response shapes
  const isDetailsResponse = (response: EsimResponse): response is EsimDetailsResponse =>
    (response as EsimDetailsResponse).pin !== undefined;
  const isHistoryResponse = (response: EsimResponse): response is EsimHistoryResponse =>
    Array.isArray((response as EsimHistoryResponse).history);
  const isBundlesResponse = (response: EsimResponse): response is EsimBundlesResponse =>
    Array.isArray((response as EsimBundlesResponse).bundles);
  const isLocationResponse = (response: EsimResponse): response is EsimLocationResponse =>
    (response as EsimLocationResponse).country !== undefined;
  const isRefreshResponse = (response: EsimResponse): response is EsimRefreshResponse =>
    (response as EsimRefreshResponse).message !== undefined;

  // Bundle state messages and colors for the Bundles modal type
  const bundleStateInfo: { [key: string]: { message: string; color: string; bgColor?: string } } = {
    processing: {
      message: t('customerPage.esimDetailsModal.bundleStateMessage.processing'),
      color: 'text-yellow-500',
    },
    queued: {
      message: t('customerPage.esimDetailsModal.bundleStateMessage.queued'),
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
    },
    active: {
      message: t('customerPage.esimDetailsModal.bundleStateMessage.active'),
      color: 'text-green-600',
    },
    depleted: {
      message: t('customerPage.esimDetailsModal.bundleStateMessage.depleted'),
      color: 'text-red-600',
    },
    expired: {
      message: t('customerPage.esimDetailsModal.bundleStateMessage.expired'),
      color: 'text-gray-500',
    },
    revoked: {
      message: t('customerPage.esimDetailsModal.bundleStateMessage.revoked'),
      color: 'text-red-600',
    },
    default: {
      message: t('customerPage.esimDetailsModal.bundleStateMessage.default'),
      color: 'text-gray-700',
    },
  };

  const getProgressBarColor = (percentage: number): string => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl relative overflow-y-auto max-h-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary rounded"
          aria-label={t('customerPage.esimDetailsModal.closeModal')}
        >
          <FaTimes size={20} />
        </button>

        <div className="p-6">
          <h2 id="modal-title" className="text-2xl font-semibold mb-4 text-center">
            {title}
          </h2>
          <h3 className="text-lg font-medium mb-4 text-center">
            {t('customerPage.esimDetailsModal.iccidLabel')} {esim.iccid}
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center">
              <FaSpinner
                className="animate-spin text-primary text-4xl mb-4"
                aria-hidden="true"
              />
              <p className="text-lg font-medium text-center">
                {t('customerPage.esimDetailsModal.loading')}
              </p>
            </div>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-600 text-lg mb-4">{error}</p>
              {modalType !== 'refresh' && (
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  {t('customerPage.esimDetailsModal.retry')}
                </button>
              )}
            </div>
          ) : data ? (
            <div>
              {/* Details Modal */}
              {modalType === 'details' && isDetailsResponse(data) && (
                <div className="flex flex-col space-y-4">
                  {data.pin ? (
                    <div className="flex flex-col items-center">
                      <QRCode value={data.pin} size={200} />
                      <div className="flex flex-col items-center mt-2">
                        <span className="font-semibold text-lg text-primary">
                          {removeTrailingColon(
                            t('customerPage.esimDetailsModal.activationCodeLabel')
                          )}
                        </span>
                        <span className="text-base">{data.pin}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-red-600 text-center">
                      {t('customerPage.esimDetailsModal.activationCodeUnavailable')}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4">
                    <span className="font-semibold">
                      {removeTrailingColon(t('customerPage.esimDetailsModal.statusLabel'))}
                    </span>
                    <span className="font-medium text-blue-600">
                      {data.profileStatus
                        ? data.profileStatus.toUpperCase()
                        : t('customerPage.esimDetailsModal.notAvailable')}
                    </span>
                  </div>
                  {data.smdpAddress && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <span className="font-semibold">
                        {removeTrailingColon(t('customerPage.esimDetailsModal.smdpAddressLabel'))}
                      </span>
                      <span>{data.smdpAddress}</span>
                    </div>
                  )}
                  {data.matchingId && (
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <span className="font-semibold">
                        {removeTrailingColon(t('customerPage.esimDetailsModal.matchingIdLabel'))}
                      </span>
                      <span>{data.matchingId}</span>
                    </div>
                  )}
                </div>
              )}

              {/* History Modal */}
              {modalType === 'history' && isHistoryResponse(data) && (
                <div>
                  {data.history && data.history.length > 0 ? (
                    <ul className="space-y-4">
                      {data.history.map((event: EsimHistoryEvent, index: number) => (
                        <li key={index} className="border p-4 rounded-md">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <span className="font-semibold">
                              {removeTrailingColon(t('customerPage.esimDetailsModal.dateLabel'))}
                            </span>
                            <span>{new Date(event.date).toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <span className="font-semibold">
                              {removeTrailingColon(t('customerPage.esimDetailsModal.nameLabel'))}
                            </span>
                            <span>{event.name}</span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <span className="font-semibold">
                              {removeTrailingColon(t('customerPage.esimDetailsModal.bundleLabel'))}
                            </span>
                            <span>{event.bundle}</span>
                          </div>
                          {event.alertType && (
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                              <span className="font-semibold">
                                {removeTrailingColon(t('customerPage.esimDetailsModal.alertTypeLabel'))}
                              </span>
                              <span>{event.alertType}</span>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-center">{t('customerPage.esimDetailsModal.noHistory')}</p>
                  )}
                </div>
              )}

              {/* Bundles Modal */}
              {modalType === 'bundles' && isBundlesResponse(data) && (
                <div>
                  {data.bundles && data.bundles.length > 0 ? (
                    <div className="space-y-6">
                      {data.bundles.map((bundle: EsimBundle, index: number) => (
                        <div key={index} className="border border-gray-600 p-4 rounded-md">
                          <h4 className="text-lg font-semibold mb-2 text-primary">
                            {removeTrailingColon(t('customerPage.esimDetailsModal.bundleNameLabel'))}{' '}
                            {bundle.friendlyName}
                          </h4>
                          {bundle.assignments && bundle.assignments.length > 0 ? (
                            <div className="space-y-4">
                              {bundle.assignments.map((assignment: EsimBundleAssignment, idx: number) => {
                                const initialQuantity = assignment.initialQuantity || 0;
                                const remainingQuantity = assignment.remainingQuantity || 0;
                                const percentageRemaining = calculatePercentage(
                                  remainingQuantity,
                                  initialQuantity
                                );
                                const bundleStateKey = assignment.bundleState
                                  ? assignment.bundleState.toLowerCase()
                                  : 'default';
                                const info =
                                  bundleStateInfo[bundleStateKey] || bundleStateInfo['default'];

                                return (
                                  <div key={idx} className="bg-slate-50 border border-gray-300 p-3 rounded-md">
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                                      <span className="font-semibold">
                                        {removeTrailingColon(
                                          t('customerPage.esimDetailsModal.assignmentIdLabel')
                                        )}
                                      </span>
                                      <span>{assignment.id}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                                      <span className="font-semibold">
                                        {removeTrailingColon(
                                          t('customerPage.esimDetailsModal.stateLabel')
                                        )}
                                      </span>
                                      <span className={`font-medium ${info.color}`}>
                                        {assignment.bundleState?.toUpperCase() ||
                                          t('customerPage.esimDetailsModal.notAvailable')}
                                      </span>
                                    </div>
                                    <p className={`mt-2 ${info.bgColor ? `${info.bgColor} p-2 rounded` : ''}`}>
                                      {info.message}
                                    </p>
                                    <div className="mt-2">
                                      <p className="mb-1 font-semibold">
                                        {removeTrailingColon(
                                          t('customerPage.esimDetailsModal.remainingQuantityLabel')
                                        )}
                                      </p>
                                      <div className="w-full bg-gray-200 rounded-full h-4">
                                        <div
                                          className={`${getProgressBarColor(percentageRemaining)} h-4 rounded-full`}
                                          style={{ width: `${percentageRemaining}%` }}
                                        ></div>
                                      </div>
                                      <p className="text-sm mt-1">
                                        {formatDataAmount(remainingQuantity)} /{' '}
                                        {formatDataAmount(initialQuantity)} remaining
                                      </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2">
                                      <span className="font-semibold">
                                        {removeTrailingColon(
                                          t('customerPage.esimDetailsModal.startTimeLabel')
                                        )}
                                      </span>
                                      <span>{formatDateOrDefault(assignment.startTime)}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                      <span className="font-semibold">
                                        {removeTrailingColon(
                                          t('customerPage.esimDetailsModal.endTimeLabel')
                                        )}
                                      </span>
                                      <span>{formatDateOrDefault(assignment.endTime)}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-center">
                              {t('customerPage.esimDetailsModal.noAssignments')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center">{t('customerPage.esimDetailsModal.noBundles')}</p>
                  )}
                </div>
              )}

              {/* Location Modal */}
              {modalType === 'location' && isLocationResponse(data) && (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="font-semibold">
                      {removeTrailingColon(t('customerPage.esimDetailsModal.countryLabel'))}
                    </span>
                    <span className="font-medium text-blue-600">
                      {data.country || t('customerPage.esimDetailsModal.notAvailable')}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="font-semibold">
                      {removeTrailingColon(t('customerPage.esimDetailsModal.networkNameLabel'))}
                    </span>
                    <span className="font-medium text-blue-600">
                      {data.networkName || t('customerPage.esimDetailsModal.notAvailable')}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="font-semibold">
                      {removeTrailingColon(t('customerPage.esimDetailsModal.mobileNetworkCodeLabel'))}
                    </span>
                    <span className="font-medium text-blue-600">
                      {data.mobileNetworkCode || t('customerPage.esimDetailsModal.notAvailable')}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <span className="font-semibold">
                      {removeTrailingColon(t('customerPage.esimDetailsModal.lastSeenLabel'))}
                    </span>
                    <span className="font-medium">
                      {data.lastSeen
                        ? new Date(data.lastSeen).toLocaleString()
                        : t('customerPage.esimDetailsModal.notAvailable')}
                    </span>
                  </div>
                </div>
              )}

              {/* Refresh Modal */}
              {modalType === 'refresh' && isRefreshResponse(data) && (
                <div className="text-center">
                  <p className="text-green-600 font-semibold">
                    {data.message ? data.message : t('customerPage.esimDetailsModal.refreshSuccess')}
                  </p>
                </div>
              )}

              {/* Fallback when no data matches expected types */}
              {!(isDetailsResponse(data) ||
                isHistoryResponse(data) ||
                isBundlesResponse(data) ||
                isLocationResponse(data) ||
                isRefreshResponse(data)) && (
                <p className="text-center">
                  {t('customerPage.esimDetailsModal.noDataAvailable')}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600">{t('customerPage.esimDetailsModal.noData')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EsimDetailsModal;
