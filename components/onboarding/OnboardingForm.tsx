'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Button } from '@/components/ui/Button';

import styles from './Onboarding.module.css';

const steps = [
  {
    image: '/images/sharelink.png',
    title: 'Share your payment link',
    description:
      'Create a payment link for any product and share it anywhere social media, email, or text. Your buyers pay with just a tap.',
  },
  {
    image: '/images/neworder.png',
    title: 'Get notified of new orders',
    description:
      'Receive instant notifications when customers place orders. Track everything from your dashboard in real time.',
  },
  {
    image: '/images/get paid.png',
    title: 'Get paid instantly',
    description:
      'Receive payments directly to your account. Simple, fast, and secure — with no complex setup required.',
  },
];

export function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const current = steps[step - 1];

  const handleNext = () => {
    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      router.push('/dashboard');
    }
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div className={styles.container}>
      <Image
        src="/images/SellSnapLogo.png"
        alt="SellSnap"
        width={120}
        height={27}
        className={styles.logo}
        priority
      />
      <div className={styles.progressBar}>
        <div className={`${styles.progressSegment} ${step >= 1 ? styles.active : ''}`} />
        <div className={`${styles.progressSegment} ${step >= 2 ? styles.active : ''}`} />
        <div className={`${styles.progressSegment} ${step >= 3 ? styles.active : ''}`} />
      </div>

      <div className={styles.step}>
        <div className={styles.imageWrapper}>
          <Image
            src={current.image}
            alt={current.title}
            width={280}
            height={280}
            className={styles.image}
            priority
          />
        </div>

        <div className={styles.stepHeader}>
          <h2 className={styles.stepTitle}>{current.title}</h2>
          <p className={styles.stepDescription}>{current.description}</p>
        </div>

        <div className={styles.actions}>
          <Button fullWidth onClick={handleNext}>
            {step < 3 ? 'Continue' : 'Go to Dashboard'}
          </Button>
          {step < 3 && (
            <button type="button" className={styles.skipButton} onClick={handleSkip}>
              Skip, go to dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
