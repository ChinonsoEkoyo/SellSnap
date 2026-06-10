import React from 'react';
import styles from './Toast.module.css';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export function Toast({ className = '', title, description, type = 'info', onClose, ...props }: ToastProps) {
  return (
    <div className={`${styles.toast} ${styles[type]} ${className}`} role="alert" {...props}>
      <div>
        <p className={styles.title}>{title}</p>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className={styles.closeButton} aria-label="Close">
          ✕
        </button>
      )}
    </div>
  );
}
