// src/components/VideoModal.tsx

'use client';

import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { useTranslations } from '@/context/TranslationsContext';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  title?: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoSrc, title }) => {
  const { t } = useTranslations();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2" // Reduced padding
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
      onClick={onClose} // Close modal when clicking on the overlay
    >
      <div
        className="bg-white p-4 rounded-lg shadow-lg relative w-full max-w-md transition-transform duration-300 ease-in-out transform scale-100" // Reduced padding and max-width
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-neutral hover:text-accent text-xl focus:outline-none focus:ring-2 focus:ring-primary rounded" // Reduced size and adjusted position
          aria-label={t('videoModal.closeButtonAriaLabel')}
        >
          <FaTimes />
        </button>

        {/* Modal Title */}
        {title && (
          <h3
            id="video-modal-title"
            className="text-base sm:text-lg font-semibold mb-2 text-center" // Decreased font size and margin
          >
            {title}
          </h3>
        )}

        {/* Video Element */}
        <video
          src={videoSrc}
          controls
          className="w-full h-auto"
          aria-label={t('videoModal.videoAriaLabel')}
        >
          {t('videoModal.videoFallbackText')}
        </video>
      </div>
    </div>
  );
};

export default VideoModal;
