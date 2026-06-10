'use client';

import React, { useState } from 'react';

import styles from './Avatar.module.css';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ className = '', src, alt = 'Avatar', fallback, size = 'md', ...props }: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const classNames = [styles.avatar, styles[size], className].filter(Boolean).join(' ');

  const showFallback = !src || hasError;

  return (
    <div className={classNames} {...props}>
      {showFallback ? (
        <span className={styles.fallback}>
          {fallback?.substring(0, 2).toUpperCase() || '?'}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={styles.image}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
