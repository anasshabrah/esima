/**
 * HTML Sanitizer utility to safely handle HTML content
 * This provides a safer alternative to dangerouslySetInnerHTML
 */

import DOMPurify from 'dompurify';
import React from 'react';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html The HTML content to sanitize
 * @param options Optional DOMPurify configuration options
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (html: string, options = {}): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'ul', 'ol', 'li',
      'b', 'i', 'strong', 'em', 'a', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'style'],
    ...options,
  });
};

interface SafeHtmlProps {
  html: string;
  className?: string;
  sanitizeOptions?: Record<string, unknown>;
}

/**
 * React component to safely render HTML content.
 * Use this component instead of directly using dangerouslySetInnerHTML.
 */
export const SafeHtml: React.FC<SafeHtmlProps> = ({
  html,
  className = '',
  sanitizeOptions = {},
}) => {
  const sanitizedHtml = sanitizeHtml(html, sanitizeOptions);
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    ></div>
  );
};

export default SafeHtml;
