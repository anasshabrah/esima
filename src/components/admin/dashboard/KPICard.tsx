'use client';

import React from 'react';

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: number;
  changeDirection?: 'up' | 'down' | 'neutral';
  changeLabel?: string;
}

export default function KPICard({
  title,
  value,
  icon,
  change = 0,
  changeDirection = 'neutral',
  changeLabel = '',
}: KPICardProps) {
  const getChangeColor = () => {
    if (changeDirection === 'up') return 'text-green-500';
    if (changeDirection === 'down') return 'text-red-500';
    return 'text-gray-500';
  };

  const getChangeIcon = () => {
    if (changeDirection === 'up') {
      return (
        <svg
          className="w-3 h-3 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      );
    }
    if (changeDirection === 'down') {
      return (
        <svg
          className="w-3 h-3 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">{icon}</div>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
        {changeLabel && (
          <div className="flex items-center mt-2">
            {getChangeIcon()}
            <span className={`text-xs ${getChangeColor()} ml-1`}>{changeLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
}
