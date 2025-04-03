// src/client/link.tsx

'use client';

import React from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import classNames from 'classnames';

interface LinkProps extends NextLinkProps {
  className?: string;
  children: React.ReactNode;
}

const Link: React.FC<LinkProps> = ({ className, children, ...props }) => {
  return (
    <NextLink className={className} {...props}>
      {children}
    </NextLink>
  );
};

export default Link;
