// src/components/FlagImage.tsx

'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface FlagImageProps extends Omit<ImageProps, 'src' | 'alt' | 'onError'> {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

const FlagImage: React.FC<FlagImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc = '/flags/default.svg',
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [imgAlt, setImgAlt] = useState<string>(alt);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setImgAlt('Default Flag');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Image
        src={imgSrc}
        alt={imgAlt}
        fill
        style={{ objectFit: 'cover' }}
        onError={handleError}
        {...props}
      />
    </div>
  );
};

export default FlagImage;
