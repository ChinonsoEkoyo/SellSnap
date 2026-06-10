import React from 'react';
import styles from './PageHeader.module.css';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ className = '', title, description, actions, ...props }: PageHeaderProps) {
  return (
    <div className={`${styles.container} ${className}`} {...props}>
      <div className={styles.titles}>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
