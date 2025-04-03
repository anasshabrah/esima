// src/components/BaseModal.tsx

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations } from '@/context/TranslationsContext';
import classNames from 'classnames';
import { FaTimes } from 'react-icons/fa';

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  showCloseButton?: boolean;
  closeOnOutsideClick?: boolean;
  className?: string;
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-3xl',
  showCloseButton = true,
  closeOnOutsideClick = true,
  className = '',
}) => {
  const { t, direction } = useTranslations();
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isRTL = direction === 'rtl';

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  const handleOutsideClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnOutsideClick && e.target === e.currentTarget) {
        handleClose();
      }
    },
    [closeOnOutsideClick, handleClose]
  );

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
      closeButtonRef.current?.focus();

      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === 'Escape') handleClose();
      };
      window.addEventListener('keydown', handleEsc);

      return () => {
        window.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = 'auto';
      };
    }
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      className={classNames(
        `fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 p-4`,
        {
          'opacity-100': isVisible,
          'opacity-0': !isVisible,
        }
      )}
      onClick={handleOutsideClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div
        className={classNames(
          `bg-white text-black rounded-lg w-11/12 ${maxWidth} mx-auto p-6 relative transform transition-transform duration-300 overflow-y-auto max-h-[90vh]`,
          {
            'scale-100': isVisible,
            'scale-95': !isVisible,
          },
          className
        )}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        {showCloseButton && (
          <button
            onClick={handleClose}
            ref={closeButtonRef}
            className={classNames(
              'absolute top-4 text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary rounded',
              {
                'right-4': !isRTL,
                'left-4': isRTL,
              }
            )}
            aria-label={t('Close')}
          >
            <FaTimes />
          </button>
        )}
        <h2 id="modal-title" className="text-2xl mb-4">
          {title}
        </h2>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default BaseModal;
