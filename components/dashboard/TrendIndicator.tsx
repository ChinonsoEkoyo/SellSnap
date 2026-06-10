import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './TrendIndicator.module.css';

interface TrendIndicatorProps {
  value: number;
  label?: string;
}

export function TrendIndicator({ value, label = 'from last month' }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isZero = value === 0;
  
  if (isZero) {
    return (
      <div className={styles.container}>
        <span className={styles.neutral}>
          <Minus size={12} />
          0%
        </span>
        <span className={styles.label}>{label}</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <span className={isPositive ? styles.positive : styles.negative}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {Math.abs(value).toFixed(1)}%
      </span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
