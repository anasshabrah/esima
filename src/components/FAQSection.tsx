'use client';

import React, { useState } from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/solid';
import { useTranslations } from '@/context/TranslationsContext';
import classNames from 'classnames';
import Script from 'next/script';

const FAQSection = () => {
  const { t, direction } = useTranslations();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqs = [
    { questionKey: 'faqSection.faq1.question', answerKey: 'faqSection.faq1.answer' },
    { questionKey: 'faqSection.faq2.question', answerKey: 'faqSection.faq2.answer' },
    { questionKey: 'faqSection.faq3.question', answerKey: 'faqSection.faq3.answer' },
    { questionKey: 'faqSection.faq4.question', answerKey: 'faqSection.faq4.answer' },
    { questionKey: 'faqSection.faq5.question', answerKey: 'faqSection.faq5.answer' },
    { questionKey: 'faqSection.faq6.question', answerKey: 'faqSection.faq6.answer' },
    { questionKey: 'faqSection.faq7.question', answerKey: 'faqSection.faq7.answer' },
    { questionKey: 'faqSection.faq8.question', answerKey: 'faqSection.faq8.answer' },
    { questionKey: 'faqSection.faq9.question', answerKey: 'faqSection.faq9.answer' },
    { questionKey: 'faqSection.faq10.question', answerKey: 'faqSection.faq10.answer' },
    { questionKey: 'faqSection.faq11.question', answerKey: 'faqSection.faq11.answer' },
    { questionKey: 'faqSection.faq12.question', answerKey: 'faqSection.faq12.answer' },
    { questionKey: 'faqSection.faq13.question', answerKey: 'faqSection.faq13.answer' },
    { questionKey: 'faqSection.faq14.question', answerKey: 'faqSection.faq14.answer' },
    { questionKey: 'faqSection.faq15.question', answerKey: 'faqSection.faq15.answer' },
  ];

  const isRTL = direction === 'rtl';

  // Generate the structured data for FAQPage
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": t(faq.questionKey),
      "acceptedAnswer": {
        "@type": "Answer",
        "text": t(faq.answerKey)
      }
    }))
  };

  return (
    <>
      <section className="container mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-md mb-8 mt-8">
        <h2 className="text-3xl font-bold text-black mb-6">{t('faqSection.title')}</h2>
        <ul className="space-y-4">
          {faqs.map((faq, index) => (
            <li
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              <button
                className={classNames(
                  'w-full flex justify-between items-start p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-300 focus:outline-none',
                  {
                    'flex-row-reverse': isRTL, // Reverse the flex direction for RTL
                  }
                )}
                onClick={() => toggleAccordion(index)}
                aria-expanded={activeIndex === index}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
              >
                {/* Adjust text alignment and margin based on direction */}
                <span
                  className={classNames(
                    'text-lg font-medium text-gray-700 flex-1',
                    {
                      'text-right': isRTL,
                      'text-left': !isRTL,
                      'ml-4': !isRTL, // Margin left for LTR
                      'mr-4': isRTL,  // Margin right for RTL
                    }
                  )}
                >
                  {t(faq.questionKey)}
                </span>
                <span
                  className={classNames('flex-shrink-0', {
                    'mr-4': isRTL, // Margin right for RTL
                    'ml-4': !isRTL, // Margin left for LTR
                  })}
                >
                  {activeIndex === index ? (
                    <MinusIcon
                      className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <PlusIcon
                      className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500"
                      aria-hidden="true"
                    />
                  )}
                </span>
              </button>
              {activeIndex === index && (
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className="p-4 bg-white border-t border-gray-200 transition-all duration-300 ease-in-out"
                >
                  <p
                    className={classNames('text-gray-600', {
                      'text-right': isRTL,
                      'text-left': !isRTL,
                    })}
                  >
                    {t(faq.answerKey)}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Inject FAQ structured data */}
      <Script
        type="application/ld+json"
        id="faq-schema"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData),
        }}
      />
    </>
  );
};

export default FAQSection;
