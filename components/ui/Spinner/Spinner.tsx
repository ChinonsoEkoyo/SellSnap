import React from 'react';
import styles from './Spinner.module.css';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ className = '', size = 'md', ...props }: SpinnerProps) {
  return (
    <div className={classNames(styles.spinnerWrapper, className)} {...props}>
      <div className={`${styles.spinner} ${styles[size]}`} aria-label="Loading" />
    </div>
  );
}

// Simple internal helper for joining conditional classes
function classNames(...args: (string | undefined | null | false)[]) {
  return args.filter(Boolean).join(' ');
}
