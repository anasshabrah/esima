// src/components/GenericModal.tsx

'use client';

import React from 'react';
import BaseModal, { BaseModalProps } from './BaseModal';

interface GenericModalProps extends Omit<BaseModalProps, 'children'> {
  children: React.ReactNode;
}

const GenericModal: React.FC<GenericModalProps> = (props) => {
  return <BaseModal {...props} />;
};

export default GenericModal;
