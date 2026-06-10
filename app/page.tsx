import Image from 'next/image';
import Link from 'next/link';
import { Wallet, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <nav className={styles.nav} aria-label="Primary navigation">
          <div className={styles.logoContainer}>
            <Image 
              src="/images/SellSnapLogo.png" 
              alt="SellSnap" 
              width={140} 
              height={32} 
              className={styles.logo}
            />
          </div>
          <div className={styles.navActions}>
            <Link href="/auth" className={styles.loginLink}>
              Login
            </Link>
            <Button asChild size="md" className={styles.navButton}>
              <Link href="/auth?mode=signup">Start Selling for Free</Link>
            </Button>
          </div>
        </nav>

        <section className={styles.hero}>
          <div className={styles.heroLeft}>
            <div className={styles.badge}>
              <span className={styles.badgeDot}></span>
              BUILT FOR NIGERIAN SELLERS
            </div>
            <h1 className={styles.headline}>
              Sell Anything<br />
              With Just A Link
            </h1>
            <p className={styles.supportingText}>
              Sell instantly, Share anywhere
            </p>
            <div className={styles.ctaWrapper}>
              <Button asChild size="lg" className={styles.primaryCta}>
                <Link href="/auth?mode=signup">Start Selling for Free</Link>
              </Button>
            </div>
            
            <div className={styles.socialProof}>
              <div className={styles.stars}>
                <Star className={styles.starIcon} fill="currentColor" />
                <Star className={styles.starIcon} fill="currentColor" />
                <Star className={styles.starIcon} fill="currentColor" />
                <Star className={styles.starIcon} fill="currentColor" />
                <Star className={styles.starIcon} fill="currentColor" />
              </div>
              <span className={styles.socialText}>4.9/5 | From 2000+ Users</span>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.productCard}>
              <div className={styles.productImageWrapper}>
                <Image
                  src="/images/LeatherToteBag.png"
                  alt="Handmade Leather Tote"
                  width={400}
                  height={280}
                  className={styles.productImage}
                  priority
                />
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productTitle}>Handmade Leather Tote</h3>
                <div className={styles.priceRow}>
                  <span className={styles.currentPrice}>₦28,500</span>
                  <span className={styles.oldPrice}>₦35,000</span>
                </div>
                <Button size="lg" fullWidth className={styles.payButton}>
                  Pay Now
                </Button>
                <div className={styles.secureFooter}>
                  Secured By <span className={styles.paystack}>Paystack</span>
                </div>
              </div>

              <div className={styles.floatingNotification}>
                <div className={styles.notificationIcon}>
                  <Wallet size={16} />
                </div>
                <div className={styles.notificationText}>
                  <span className={styles.notificationAmount}>+₦28,500</span>
                  <span className={styles.notificationTime}>Just now</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
