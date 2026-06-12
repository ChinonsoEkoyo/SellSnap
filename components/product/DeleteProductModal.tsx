'use client';

import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

import { deleteProduct } from '@/app/actions/product';
import { Button } from '@/components/ui/Button';
import styles from './CreateProductOverlay.module.css';

interface DeleteProductModalProps {
  product: { id: string; name: string };
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteProductModal({ product, onClose, onDeleted }: DeleteProductModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError('');

    const result = await deleteProduct(product.id);
    if (result.message) {
      setError(result.message);
      setDeleting(false);
    } else {
      onDeleted?.();
      onClose();
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.overlay} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Delete Product</h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <div style={{ textAlign: 'center', padding: 'var(--spacing-4) 0' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              backgroundColor: 'var(--color-error-container)', color: 'var(--color-error)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto var(--spacing-4)',
            }}>
              <AlertTriangle size={24} />
            </div>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Are you sure?
            </p>
            <p style={{ margin: 'var(--spacing-2) 0 0', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              This will permanently delete <strong>{product.name}</strong> and all its orders. This action cannot be undone.
            </p>
          </div>

          {error ? (
            <p className={styles.error} role="alert">{error}</p>
          ) : null}

          <div className={styles.footer}>
            <Button type="button" variant="ghost" onClick={onClose} disabled={deleting}>
              Cancel
            </Button>
            <Button
              type="button"
              fullWidth
              isLoading={deleting}
              onClick={handleDelete}
              style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }}
            >
              Delete Product
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}