'use client';

import { useEffect, useState, useRef } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { X, ChevronDown } from 'lucide-react';

import { updateProduct, type ProductFormState } from '@/app/actions/product';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ImageUpload } from '@/components/ui/ImageUpload';
import styles from './CreateProductOverlay.module.css';

const initialFormState: ProductFormState = { message: '' };

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

interface EditProductOverlayProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    imageUrls: string | null;
    stockType: string;
    stockQuantity: number | null;
  };
  onClose: () => void;
  onProductUpdated?: (product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    imageUrl: string | null;
    imageUrls: string | null;
    description: string | null;
    stockType: string;
    stockQuantity: number | null;
  }) => void;
}

export function EditProductOverlay({ product, onClose, onProductUpdated }: EditProductOverlayProps) {
  const [state, action] = useActionState(updateProduct, initialFormState);
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || '');
  const [price, setPrice] = useState(() => (product.price / 100).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).replace(/,/g, ','));
  const [stockType, setStockType] = useState<'limited' | 'unlimited'>((product.stockType as 'limited' | 'unlimited') || 'unlimited');
  const [stockQty, setStockQty] = useState(product.stockQuantity?.toString() || '');
  const [errors, setErrors] = useState<{ name?: string; price?: string; stockQty?: string }>({});
  const [imageUrl, setImageUrl] = useState<string | null>(product.imageUrl);
  const [initialImageUrls] = useState<string[]>(() => {
    if (product.imageUrls) {
      try { return JSON.parse(product.imageUrls); } catch { return []; }
    }
    return product.imageUrl ? [product.imageUrl] : [];
  });
  const [imageUrls, setImageUrls] = useState<string[]>(initialImageUrls);
  const onProductUpdatedRef = useRef(onProductUpdated);
  onProductUpdatedRef.current = onProductUpdated;

  useEffect(() => {
    if (state.success && state.product) {
      onProductUpdatedRef.current?.(state.product);
      onClose();
    }
  }, [state.success, state.product, onClose]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatComma(e.target.value);
    setPrice(formatted);
    setErrors((prev) => ({ ...prev, price: getPriceError(formatted) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    const nameError = getRequiredError(name);
    const priceError = getPriceError(price);
    let stockQtyError: string | undefined;
    if (stockType === 'limited' && !stockQty.trim()) {
      stockQtyError = 'Enter stock quantity';
    }
    setErrors({ name: nameError, price: priceError, stockQty: stockQtyError });
    if (nameError || priceError || stockQtyError) {
      e.preventDefault();
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.overlay} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Edit Product</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form action={action} className={styles.body} noValidate onSubmit={handleSubmit}>
          <input type="hidden" name="id" value={product.id} />
          <input type="hidden" name="name" value={name} />
          <input type="hidden" name="description" value={description} />
          <input type="hidden" name="price" value={price.replace(/,/g, '')} />
          <input type="hidden" name="imageUrl" value={imageUrl || ''} />
          <input type="hidden" name="imageUrls" value={JSON.stringify(imageUrls)} />
          <input type="hidden" name="stockType" value={stockType} />
          <input type="hidden" name="stockQuantity" value={stockQty} />

          {state.message ? (
            <p className={styles.error} role="alert">{state.message}</p>
          ) : null}

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
                placeholder="Increase sales with vivid product description"
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
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" fullWidth isLoading={pending}>
      Save Changes
    </Button>
  );
}