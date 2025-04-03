// src/app/not-found.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './not-found.module.css';
import { useTranslations } from '@/context/TranslationsContext';

const NotFoundPage: React.FC = () => {
  const { t } = useTranslations();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Image
          src="/images/404-illustration.svg"
          alt={t('notFound.imageAlt') || 'Page Not Found Illustration'}
          width={400}
          height={300}
          className={styles.image}
        />
        <h1 className={styles.title}>
          {t('notFound.title') || 'Page Not Found'}
        </h1>
        <p className={styles.description}>
          {t('notFound.description') ||
            "Oops! The page you're looking for doesn't exist or has been moved."}
        </p>
        <Link href="/" className={styles.button}>
          {t('notFound.homeButton') || 'Go to Home'}
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
