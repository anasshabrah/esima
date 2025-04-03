'use client';

import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function SystemHealthMonitor() {
  // Sample data - in a real implementation, this would come from an API
  const metrics = [
    { name: 'Server CPU', value: 28, max: 100, color: '#4f46e5' },
    { name: 'Memory Usage', value: 42, max: 100, color: '#10b981' },
    { name: 'Disk Space', value: 65, max: 100, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      {metrics.map((metric) => (
        <div key={metric.name} className="flex items-center">
          <div className="w-16 h-16 mr-4">
            <CircularProgressbar
              value={metric.value}
              maxValue={metric.max}
              text={`${metric.value}%`}
              styles={buildStyles({
                textSize: '1.5rem',
                pathColor: metric.color,
                textColor: metric.color,
                trailColor: '#e5e7eb',
              })}
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{metric.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {metric.value}% of {metric.max}%
            </p>
          </div>
        </div>
      ))}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
