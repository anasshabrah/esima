// src/components/TermsConditionsModal.tsx

'use client';

import React from 'react';
import GenericModal from './GenericModal';
import { useTranslations } from '@/context/TranslationsContext';

interface TermsConditionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsConditionsModal: React.FC<TermsConditionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslations();

  return (
    <GenericModal
      isOpen={isOpen}
      onClose={onClose}
      title={t('termsConditionsModal.title')}
    >
      <div
        className="prose max-w-none overflow-y-auto"
        style={{ maxHeight: '400px' }}
      >
        <p>{t('termsConditionsModal.lastUpdated')}</p>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          {t('termsConditionsModal.definitions.title')}
        </h2>
        <p>
          <strong>{t('termsConditionsModal.definitions.intro')}</strong>
        </p>
        <ul>
          <li>{t('termsConditionsModal.definitions.agreement')}</li>
          <li>{t('termsConditionsModal.definitions.charges')}</li>
          <li>{t('termsConditionsModal.definitions.contract')}</li>
          <li>{t('termsConditionsModal.definitions.creditRating')}</li>
          <li>{t('termsConditionsModal.definitions.data')}</li>
          <li>{t('termsConditionsModal.definitions.dataProtectionLegislation')}</li>
          <li>{t('termsConditionsModal.definitions.esimProfile')}</li>
          <li>{t('termsConditionsModal.definitions.alodataAPI')}</li>
          <li>{t('termsConditionsModal.definitions.mobileData')}</li>
          <li>{t('termsConditionsModal.definitions.network')}</li>
          <li>{t('termsConditionsModal.definitions.services')}</li>
          <li>{t('termsConditionsModal.definitions.vat')}</li>
          <li>{t('termsConditionsModal.definitions.workingDay')}</li>
        </ul>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          {t('termsConditionsModal.incorporation.title')}
        </h2>
        <p>
          <strong>{t('termsConditionsModal.incorporation.intro')}</strong>
        </p>
        <ul>
          <li>{t('termsConditionsModal.incorporation.precedence1')}</li>
          <li>{t('termsConditionsModal.incorporation.precedence2')}</li>
          <li>{t('termsConditionsModal.incorporation.precedence3')}</li>
        </ul>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          {t('termsConditionsModal.provision.title')}
        </h2>
        <ul>
          <li>{t('termsConditionsModal.provision.service1')}</li>
          <li>{t('termsConditionsModal.provision.service2')}</li>
          <li>{t('termsConditionsModal.provision.service3')}</li>
          <li>{t('termsConditionsModal.provision.service4')}</li>
        </ul>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          {t('termsConditionsModal.postPaid.title')}
        </h2>
        <ul>
          <li>{t('termsConditionsModal.postPaid.service1')}</li>
          <li>{t('termsConditionsModal.postPaid.service2')}</li>
          <li>{t('termsConditionsModal.postPaid.service3')}</li>
        </ul>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          {t('termsConditionsModal.prePaid.title')}
        </h2>
        <ul>
          <li>{t('termsConditionsModal.prePaid.service1')}</li>
          <li>{t('termsConditionsModal.prePaid.service2')}</li>
          <li>{t('termsConditionsModal.prePaid.service3')}</li>
        </ul>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          {t('termsConditionsModal.rates.title')}
        </h2>
        <ul>
          <li>{t('termsConditionsModal.rates.service1')}</li>
          <li>{t('termsConditionsModal.rates.service2')}</li>
          <li>{t('termsConditionsModal.rates.service3')}</li>
        </ul>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          {t('termsConditionsModal.governingLaw.title')}
        </h2>
        <p>
          <strong>{t('termsConditionsModal.governingLaw.service1')}</strong>
        </p>
      </div>
    </GenericModal>
  );
};

export default TermsConditionsModal;
