'use client';

import React from 'react';
import LocalizedLink from './LocalizedLink';
import { FaHome } from 'react-icons/fa';
import { BreadcrumbItem } from '@/types/types';
import { useTranslations } from '@/context/TranslationsContext';
import classNames from 'classnames';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const { t, direction } = useTranslations();

  // Determine if the layout is RTL
  const isRTL = direction === 'rtl';

  // Filter out the "Countries" breadcrumb item
  const filteredItems = items.filter((item) => item.name !== 'Countries');

  return (
    <nav
      className="container mx-auto p-4 text-base text-gray-600"
      aria-label={t('breadcrumbs.ariaLabel')}
    >
      <ol
        className={classNames(
          "list-none p-0 inline-flex items-center",
          {
            'justify-start': !isRTL, // Align to start (left) for LTR
            'justify-end': isRTL,    // Align to end (right) for RTL
          }
        )}
      >
        {filteredItems.map((item, index) => (
          <li className="flex items-center" key={index}>
            {index === 0 && item.href ? (
              // Render only the first item ("Home") as a clickable link
              <LocalizedLink
                href={item.href}
                className="text-blue-600 hover:underline flex items-center gap-3"
              >
                <FaHome
                  className="w-4 h-4 text-gray-500"
                  aria-hidden="true"
                />
                {t('breadcrumbs.home')}
              </LocalizedLink>
            ) : (
              // Render the rest as plain text
              <span className="text-gray-500 flex items-center gap-3">
                {index === 0 && (
                  <FaHome
                    className="w-4 h-4 text-gray-500"
                    aria-hidden="true"
                  />
                )}
                {index === 0 ? t('breadcrumbs.home') : item.name}
              </span>
            )}
            {index < filteredItems.length - 1 && (
              <svg
                className={classNames(
                  "w-4 h-4 text-gray-400 mx-2",
                  {
                    'transform rotate-180': isRTL, // Rotate arrow in RTL
                  }
                )}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
