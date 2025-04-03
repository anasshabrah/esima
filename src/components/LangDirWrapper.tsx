// src/components/LangDirWrapper.tsx

import React, { ReactNode } from 'react';

interface LangDirWrapperProps {
  children: ReactNode;
}

const LangDirWrapper: React.FC<LangDirWrapperProps> = ({ children }) => {
  return <>{children}</>;
};

export default LangDirWrapper;
