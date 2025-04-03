// src/components/LocalizedLink.tsx

import Link, { LinkProps } from 'next/link';
import { useTranslations } from '@/context/TranslationsContext';
import { defaultLanguage } from '@/translations/supportedLanguages';
import React from 'react';
import { UrlObject } from 'url';

type LocalizedLinkProps = LinkProps & {
  children: React.ReactNode;
  className?: string;
};

const LocalizedLink = ({ href, children, className, ...props }: LocalizedLinkProps) => {
  const { language } = useTranslations();

  let normalizedHref: string;

  if (typeof href === 'string') {
    normalizedHref = href.startsWith('/') ? href : `/${href}`;
  } else {
    normalizedHref = href.pathname ? (href.pathname.startsWith('/') ? href.pathname : `/${href.pathname}`) : '/';
  }

  // If the current language is the default language, don't prepend it
  const localizedHref =
    language === defaultLanguage.code ? normalizedHref : `/${language}${normalizedHref}`;

  const finalHref: string | UrlObject =
    typeof href === 'string'
      ? localizedHref
      : { ...href, pathname: localizedHref };

  return (
    <Link href={finalHref} className={className} {...props}>
      {children}
    </Link>
  );
};

export default LocalizedLink;
