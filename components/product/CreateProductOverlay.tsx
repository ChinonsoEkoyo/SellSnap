'use client';

import { useEffect, useState, useRef } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { X, Check, Copy, Share2, ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';

import { createProduct, type ProductFormState } from '@/app/actions/product';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import styles from './CreateProductOverlay.module.css';

const initialFormState: ProductFormState = {
  message: '',
};

function getRequiredError(value: string): string | undefined {
  return !value.trim() ? 'Field cannot be empty' : undefined;
}

function getPriceError(value: string): string | undefined {
  const cleaned = value.replace(/,/g, '');
  const trimmed = cleaned.trim();
  if (!trimmed) return 'Field cannot be empty';
  const num = Number(trimmed);
  if (Number.isNaN(num) || num < 1) return 'Enter a valid price';
  return undefined;
}

function formatComma(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

interface CreateProductOverlayProps {
  onClose: () => void;
  onProductCreated?: (product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    description: string | null;
    imageUrl: string | null;
    imageUrls: string | null;
    stockType: string;
    stockQuantity: number | null;
    isPublished: boolean;
    createdAt: Date;
  }) => void;
}

export function CreateProductOverlay({ onClose, onProductCreated }: CreateProductOverlayProps) {
  const [state, action] = useActionState(createProduct, initialFormState);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stockType, setStockType] = useState<'limited' | 'unlimited'>('unlimited');
  const [stockQty, setStockQty] = useState('');
  const [errors, setErrors] = useState<{ name?: string; price?: string; stockQty?: string }>({});
  const [copied, setCopied] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const onProductCreatedRef = useRef(onProductCreated);
  onProductCreatedRef.current = onProductCreated;

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  useEffect(() => {
    if (state.success && state.product) {
      setStep(3);
      onProductCreatedRef.current?.({
        id: state.product.id,
        name: state.product.name,
        slug: state.product.slug,
        price: Math.round(parseFloat(price.replace(/,/g, '')) * 100),
        description: description || null,
        imageUrl: imageUrl || null,
        imageUrls: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
        stockType,
        stockQuantity: stockType === 'limited' && stockQty ? parseInt(stockQty, 10) : null,
        isPublished: true,
        createdAt: new Date(),
      });
    }
  }, [state.success, state.product, price, description, imageUrl, imageUrls]);

  const validateStep1 = () => {
    const nameError = getRequiredError(name);
    const priceError = getPriceError(price);
    let stockQtyError: string | undefined;
    if (stockType === 'limited' && !stockQty.trim()) {
      stockQtyError = 'Enter stock quantity';
    }
    setErrors({ name: nameError, price: priceError, stockQty: stockQtyError });
    return !nameError && !priceError && !stockQtyError;
  };

  if (step === 3 && state.product) {
    const product = state.product;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const productUrl = `${origin}/p/${product.slug}`;

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(productUrl);
        setCopied(true);
      } catch {
        // fallback
      }
    };

    const handleShare = async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: product.name,
            text: `Check out ${product.name}`,
            url: productUrl,
          });
        } catch {
          // user cancelled
        }
      } else {
        handleCopy();
      }
    };

    return (
      <div className={styles.backdrop} onClick={onClose}>
        <div className={styles.overlay} onClick={(e) => e.stopPropagation()}>
          <button type="button" className={styles.closeTop} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
          <div className={styles.successBody}>
            <div className={styles.successIcon}>
              <Check size={32} />
            </div>
            <h2 className={styles.successTitle}>Product Created</h2>
            <p className={styles.successName}>{product.name}</p>
            <div className={styles.linkBox}>
              <span className={styles.linkUrl}>{productUrl}</span>
            </div>
            <div className={styles.successActions}>
              <Button fullWidth onClick={handleCopy}>
                {copied ? (
                  <><Check size={16} /> Copied!</>
                ) : (
                  <><Copy size={16} /> Copy Link</>
                )}
              </Button>
              <Button fullWidth variant="secondary" onClick={handleShare}>
                <Share2 size={16} /> Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatComma(e.target.value);
    setPrice(formatted);
    setErrors((prev) => ({ ...prev, price: getPriceError(formatted) }));
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.overlay} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create Product</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className={styles.steps}>
          <div className={`${styles.stepDot} ${styles.stepActive}`}>
            <span>{1}</span>
          </div>
          <div className={`${styles.stepLine} ${step >= 2 ? styles.stepLineActive : ''}`} />
          <div className={`${styles.stepDot} ${step >= 2 ? styles.stepActive : ''}`}>
            <span>{2}</span>
          </div>
        </div>

        <form action={action} className={styles.body} noValidate>
          <input type="hidden" name="name" value={name} />
          <input type="hidden" name="description" value={description} />
          <input type="hidden" name="price" value={price.replace(/,/g, '')} />
          <input type="hidden" name="imageUrl" value={imageUrl || ''} />
          <input type="hidden" name="imageUrls" value={JSON.stringify(imageUrls)} />
          <input type="hidden" name="stockType" value={stockType} />
          <input type="hidden" name="stockQuantity" value={stockQty} />

          {state.message ? (
            <p className={styles.error} role="alert">
              {state.message}
            </p>
          ) : null}

          {step === 1 && (
            <>
              <div className={styles.formFields}>
                <Input
                  label="Product Name"
                  name="product-name"
                  type="text"
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: getRequiredError(e.target.value) })); }}
                  onBlur={(e) => setErrors((prev) => ({ ...prev, name: getRequiredError(e.target.value) }))}
                  error={errors.name}
                  placeholder="e.g. Handmade Leather Tote"
                />

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="product-description">Product Description</label>
                  <textarea
                    id="product-description"
                    className={styles.textarea}
                    rows={4}
                    placeholder="Increase sales with vivid product description that gives customers reason to buy"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <Input
                  label="Price (₦)"
                  name="product-price"
                  type="text"
                  inputMode="decimal"
                  required
                  value={price}
                  onChange={handlePriceChange}
                  onBlur={(e) => setErrors((prev) => ({ ...prev, price: getPriceError(e.target.value) }))}
                  error={errors.price}
                  placeholder="e.g. 28,500"
                />

                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel}>Stock</label>
                  <div className={styles.stockRow}>
                    <div className={styles.selectWrapper}>
                      <select
                        className={styles.select}
                        value={stockType}
                        onChange={(e) => setStockType(e.target.value as 'limited' | 'unlimited')}
                      >
                        <option value="unlimited">Unlimited</option>
                        <option value="limited">Limited</option>
                      </select>
                      <ChevronDown size={14} className={styles.selectIcon} />
                    </div>
                    {stockType === 'limited' && (
                      <input
                        type="number"
                        min="1"
                        className={`${styles.qtyInput} ${errors.stockQty ? styles.inputError : ''}`}
                        placeholder="Quantity of Stock"
                        value={stockQty}
                        onChange={(e) => { setStockQty(e.target.value); setErrors((prev) => ({ ...prev, stockQty: undefined })); }}
                      />
                    )}
                  </div>
                  {errors.stockQty && <p className={styles.errorText}>{errors.stockQty}</p>}
                </div>
              </div>

              <div className={styles.footer}>
                <div />
                <Button type="button" onClick={() => { if (validateStep1()) setStep(2); }}>
                  Next
                  <ArrowRight size={16} />
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className={styles.formFields}>
                <ImageUpload
                  value={imageUrl}
                  values={imageUrls}
                  onChange={(url, urls) => {
                    setImageUrl(url);
                    if (urls) setImageUrls(urls);
                  }}
                />
              </div>

              <div className={styles.footer}>
                <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft size={16} />
                  Back
                </Button>
                <SubmitButton />
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

function SubmitButton({ onClick }: { onClick?: () => void }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" fullWidth isLoading={pending} onClick={onClick}>
      Create Product
    </Button>
  );
}
