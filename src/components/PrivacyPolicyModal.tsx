// src/components/PrivacyPolicyModal.tsx

'use client';

import React from 'react';
import GenericModal from './GenericModal';
import { useTranslations } from '@/context/TranslationsContext';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslations();

  return (
    <GenericModal isOpen={isOpen} onClose={onClose} title={t('privacyPolicyModal.title')}>
      <div
        className="prose max-w-none overflow-y-auto"
        style={{ maxHeight: '400px' }}
      >
        <p>{t('privacyPolicyModal.lastUpdated')}</p>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          {t('privacyPolicyModal.introduction.title')}
        </h2>
        <p>{t('privacyPolicyModal.introduction.paragraph1')}</p>
        <p>{t('privacyPolicyModal.introduction.paragraph2')}</p>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          {t('privacyPolicyModal.informationWeCollect.title')}
        </h2>
        <p>{t('privacyPolicyModal.informationWeCollect.paragraph1')}</p>
        <ul>
          <li dangerouslySetInnerHTML={{ __html: t('privacyPolicyModal.informationWeCollect.list1') }}></li>
          <li dangerouslySetInnerHTML={{ __html: t('privacyPolicyModal.informationWeCollect.list2') }}></li>
          <li dangerouslySetInnerHTML={{ __html: t('privacyPolicyModal.informationWeCollect.list3') }}></li>
          <li dangerouslySetInnerHTML={{ __html: t('privacyPolicyModal.informationWeCollect.list4') }}></li>
        </ul>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          {t('privacyPolicyModal.howWeUse.title')}
        </h2>
        <p>{t('privacyPolicyModal.howWeUse.paragraph1')}</p>
        <ul>
          <li>{t('privacyPolicyModal.howWeUse.list1')}</li>
          <li>{t('privacyPolicyModal.howWeUse.list2')}</li>
          <li>{t('privacyPolicyModal.howWeUse.list3')}</li>
          <li>{t('privacyPolicyModal.howWeUse.list4')}</li>
          <li>{t('privacyPolicyModal.howWeUse.list5')}</li>
          <li>{t('privacyPolicyModal.howWeUse.list6')}</li>
        </ul>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          {t('privacyPolicyModal.dataSharing.title')}
        </h2>
        <p>{t('privacyPolicyModal.dataSharing.paragraph1')}</p>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          {t('privacyPolicyModal.consent.title')}
        </h2>
        <p dangerouslySetInnerHTML={{ __html: t('privacyPolicyModal.consent.paragraph1') }}></p>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          {t('privacyPolicyModal.dataRetention.title')}
        </h2>
        <p>{t('privacyPolicyModal.dataRetention.paragraph1')}</p>
        <ul>
          <li>{t('privacyPolicyModal.dataRetention.list1')}</li>
          <li>{t('privacyPolicyModal.dataRetention.list2')}</li>
        </ul>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          {t('privacyPolicyModal.security.title')}
        </h2>
        <p>{t('privacyPolicyModal.security.paragraph1')}</p>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          {t('privacyPolicyModal.payments.title')}
        </h2>
        <p>{t('privacyPolicyModal.payments.paragraph1')}</p>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          {t('privacyPolicyModal.cookies.title')}
        </h2>
        <p>{t('privacyPolicyModal.cookies.paragraph1')}</p>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          {t('privacyPolicyModal.ageOfConsent.title')}
        </h2>
        <p>{t('privacyPolicyModal.ageOfConsent.paragraph1')}</p>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          {t('privacyPolicyModal.updates.title')}
        </h2>
        <p>{t('privacyPolicyModal.updates.paragraph1')}</p>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          {t('privacyPolicyModal.yourRights.title')}
        </h2>
        <p>{t('privacyPolicyModal.yourRights.paragraph1')}</p>
        <ul>
          <li>{t('privacyPolicyModal.yourRights.list1')}</li>
          <li>{t('privacyPolicyModal.yourRights.list2')}</li>
          <li>{t('privacyPolicyModal.yourRights.list3')}</li>
        </ul>
        <p>{t('privacyPolicyModal.yourRights.paragraph2')}</p>
        <address dangerouslySetInnerHTML={{ __html: t('privacyPolicyModal.yourRights.address') }}></address>
      </div>
    </GenericModal>
  );
};

export default PrivacyPolicyModal;
