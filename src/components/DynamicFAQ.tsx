// src/components/DynamicFAQ.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from '@/context/TranslationsContext';

interface FAQItem {
  question: string;
  answer: string;
}

interface DynamicFAQProps {
  countryIso: string;
}

const DynamicFAQ: React.FC<DynamicFAQProps> = ({ countryIso }) => {
  const { t } = useTranslations();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!countryIso) {
      setError(t('countryPage.faq.invalidCountry'));
      setLoading(false);
      return;
    }

    const fetchFAQs = async () => {
      try {
        const response = await fetch(`/api/faqs?countryIso=${countryIso}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(t('countryPage.faq.notFound'));
          } else if (response.status === 400) {
            throw new Error(t('countryPage.faq.badRequest'));
          } else {
            throw new Error(t('countryPage.faq.fetchError'));
          }
        }
        const data: FAQItem[] = await response.json();
        setFaqs(data);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(t('countryPage.faq.unknownError'));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, [countryIso, t]);

  if (loading) {
    return <p className="text-center text-gray-500">{t('countryPage.faq.loading')}</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <section className="mt-16">
      <h3 className="text-2xl font-semibold mb-4">
        {t('countryPage.dynamicFaq.title')}
      </h3>
      <div className="space-y-4">
        {faqs.length > 0 ? (
          faqs.map((faq, index) => (
            <div key={index} className="border-b pb-4">
              <h4 className="text-xl font-semibold">{faq.question}</h4>
              <p className="text-lg text-gray-700">{faq.answer}</p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">{t('countryPage.faq.noFaqs')}</p>
        )}
      </div>
    </section>
  );
};

export default DynamicFAQ;
