'use client';

import { useState, useCallback } from 'react';
import { Check, Lock, Minus, Plus, ChevronLeft } from 'lucide-react';
import { confirmPayment } from '@/app/actions/order';
import styles from './page.module.css';

interface ProductBuyFormProps {
  productId: string;
  unitPrice: number;
  stockType: string;
  stockQuantity: number | null;
  paystackPublicKey: string;
}

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).PaystackPop) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.head.appendChild(script);
  });
}

export function ProductBuyForm({ productId, unitPrice, stockType, stockQuantity, paystackPublicKey }: ProductBuyFormProps) {
  const [step, setStep] = useState<'form' | 'review'>('form');
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const maxQty = stockType === 'limited' && stockQuantity ? stockQuantity : 99;
  const total = (unitPrice * quantity) / 100;
  const formattedTotal = total.toLocaleString('en-NG', { style: 'currency', currency: 'NGN' });
  const formattedUnit = (unitPrice / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' });
  const amountInKobo = unitPrice * quantity;

  const payWithPaystack = useCallback(async () => {
    setProcessing(true);
    setError('');

    try {
      await loadPaystackScript();

      const PaystackPop = (window as any).PaystackPop;

      if (!PaystackPop || typeof PaystackPop.setup !== 'function') {
        throw new Error('Paystack SDK not available');
      }

      const ref = `SS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const handler = PaystackPop.setup({
        key: paystackPublicKey,
        email: buyerEmail,
        amount: amountInKobo,
        currency: 'NGN',
        ref,
        metadata: {
          productId,
          buyerName,
          buyerPhone,
          deliveryAddress,
          quantity,
        },
        callback: (response: any) => {
          confirmPayment({
            productId,
            buyerName,
            buyerEmail,
            buyerPhone,
            deliveryAddress,
            quantity,
            paymentRef: response.reference,
          }).then((result) => {
            if (result.success) {
              setPaymentSuccess(true);
            } else {
              setError(result.message);
            }
            setProcessing(false);
          }).catch(() => {
            setError('Payment could not be confirmed. Please contact support.');
            setProcessing(false);
          });
        },
        onClose: () => {
          setProcessing(false);
        },
      });

      handler.openIframe();
    } catch (err) {
      console.error('Paystack error:', err);
      setError('Payment system unavailable. Please try again.');
      setProcessing(false);
    }
  }, [buyerEmail, buyerName, buyerPhone, deliveryAddress, quantity, productId, amountInKobo, paystackPublicKey]);

  if (paymentSuccess) {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon}>
          <Check size={28} />
        </div>
        <h2 className={styles.successTitle}>Order Placed!</h2>
        <p className={styles.successText}>
          We&apos;ve sent confirmation to {buyerEmail}. The seller will reach out to you.
        </p>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className={styles.reviewCard}>
        <button type="button" className={styles.backBtn} onClick={() => setStep('form')}>
          <ChevronLeft size={16} />
          Edit details
        </button>

        <div className={styles.reviewSection}>
          <h3 className={styles.reviewHeading}>Review your order</h3>

          <div className={styles.reviewRow}>
            <span className={styles.reviewLabel}>Name</span>
            <span className={styles.reviewValue}>{buyerName}</span>
          </div>
          <div className={styles.reviewRow}>
            <span className={styles.reviewLabel}>Email</span>
            <span className={styles.reviewValue}>{buyerEmail}</span>
          </div>
          <div className={styles.reviewRow}>
            <span className={styles.reviewLabel}>Phone</span>
            <span className={styles.reviewValue}>{buyerPhone}</span>
          </div>
          <div className={styles.reviewRow}>
            <span className={styles.reviewLabel}>Delivery</span>
            <span className={styles.reviewValue}>{deliveryAddress}</span>
          </div>
          <div className={styles.reviewRow}>
            <span className={styles.reviewLabel}>Quantity</span>
            <span className={styles.reviewValue}>{quantity}</span>
          </div>
          <div className={styles.reviewTotal}>
            <span className={styles.reviewTotalLabel}>Total</span>
            <span className={styles.reviewTotalValue}>{formattedTotal}</span>
          </div>
        </div>

        {error ? (
          <p className={styles.globalError} role="alert">{error}</p>
        ) : null}

        <button
          type="button"
          className={styles.submitButton}
          onClick={payWithPaystack}
          disabled={processing}
        >
          {processing ? 'Processing...' : `Pay ${formattedTotal}`}
        </button>
        <p className={styles.secureFooter}>
          <Lock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          Secured by <span className={styles.paystack}>Paystack</span>
        </p>
      </div>
    );
  }

  return (
    <form className={styles.form} noValidate>
      <input type="hidden" name="productId" value={productId} />

      {error ? (
        <p className={styles.globalError} role="alert">{error}</p>
      ) : null}

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="buyerName">Full Name</label>
        <input
          id="buyerName"
          name="buyerName"
          type="text"
          className={styles.input}
          required
          value={buyerName}
          onChange={(e) => setBuyerName(e.target.value)}
          placeholder="Your full name"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="buyerEmail">Email</label>
        <input
          id="buyerEmail"
          name="buyerEmail"
          type="email"
          className={styles.input}
          required
          value={buyerEmail}
          onChange={(e) => setBuyerEmail(e.target.value)}
          placeholder="your@email.com"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="buyerPhone">Phone</label>
        <input
          id="buyerPhone"
          name="buyerPhone"
          type="tel"
          className={styles.input}
          required
          value={buyerPhone}
          onChange={(e) => setBuyerPhone(e.target.value)}
          placeholder="0801 234 5678"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="deliveryAddress">Delivery Address</label>
        <textarea
          id="deliveryAddress"
          name="deliveryAddress"
          className={styles.textarea}
          rows={2}
          required
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          placeholder="Street, city, state"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.label}>Quantity</label>
        <div className={styles.qtyRow}>
          <button
            type="button"
            className={styles.qtyBtn}
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus size={14} />
          </button>
          <span className={styles.qtyValue}>{quantity}</span>
          <button
            type="button"
            className={styles.qtyBtn}
            onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
            disabled={quantity >= maxQty}
          >
            <Plus size={14} />
          </button>
            <span className={styles.qtyHint}>{formattedUnit} each</span>
        </div>
      </div>

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total</span>
        <span className={styles.totalValue}>{formattedTotal}</span>
      </div>

      <button type="button" className={styles.reviewButton} onClick={() => setStep('review')}>
        Review and pay
      </button>

      <p className={styles.secureFooter}>
        <Lock size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
        Secured by <span className={styles.paystack}>Paystack</span>
      </p>
    </form>
  );
}
