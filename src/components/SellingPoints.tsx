// src/app/[countryIso]/SellingPoints.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from '@/context/TranslationsContext';
import classNames from 'classnames';

const SellingPoints: React.FC = () => {
  const { t, direction } = useTranslations();

  const sellingPoints: string[] = [
    t('sellingPoints.point1'),
    t('sellingPoints.point2'),
    t('sellingPoints.point3'),
    t('sellingPoints.point4'),
    t('sellingPoints.point5'),
    t('sellingPoints.point6'),
  ];

  const [currentPointIndex, setCurrentPointIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPointIndex(
        (prevIndex) => (prevIndex + 1) % sellingPoints.length
      );
    }, 3000); // Change point every 3 seconds

    return () => clearInterval(interval);
  }, [sellingPoints.length]);

  // Determine if the layout is RTL
  const isRTL = direction === 'rtl';

  return (
    <div className="mb-6">
      <div className="flex justify-center items-center min-h-[50px]">
        <div
          className={classNames(
            "bg-black bg-opacity-50 rounded-lg shadow-md p-4 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl text-center transition-transform mx-auto",
            {
              'text-right': isRTL, // Align text right in RTL
              'text-left': !isRTL, // Align text left in LTR
            }
          )}
        >
          <p className="text-lg sm:text-xl font-semibold text-[#ececec]">
            {sellingPoints[currentPointIndex]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SellingPoints;
