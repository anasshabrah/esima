// src/components/BackgroundImage.tsx

'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

interface BackgroundImageProps extends ImageProps {
  fallbackSrc: string;
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({
  src,
  alt,
  fallbackSrc,
  ...rest
}) => {
  // Adjust the state type to accommodate both string and StaticImport
  const [imgSrc, setImgSrc] = useState<ImageProps['src']>(src);

  const handleError = () => {
    setImgSrc(fallbackSrc);
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      onError={handleError}
      {...rest}
    />
  );
};

export default BackgroundImage;
