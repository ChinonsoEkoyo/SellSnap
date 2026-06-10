import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import styles from './layout.module.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <Link href="/" className={styles.logoLink}>
        <Image
          src="/images/SellSnapLogo.png"
          alt="SellSnap"
          width={140}
          height={32}
          className={styles.logo}
          priority
        />
      </Link>
      <main className={styles.content}>{children}</main>
    </div>
  );
}
