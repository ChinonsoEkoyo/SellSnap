'use client';

import { useState } from 'react';
import { Copy, Share2, Pencil, Trash2, Check } from 'lucide-react';

import { deleteProduct } from '@/app/actions/product';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl?: string | null;
    imageUrls?: string | null;
    slug: string;
  };
  listView?: boolean;
}

export function ProductCard({ product, listView }: ProductCardProps) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const formattedPrice = (product.price / 100).toLocaleString('en-NG', {
    style: 'currency',
    currency: 'NGN',
  });
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const productUrl = `${origin}/p/${product.slug}`;

  const displayImage = product.imageUrl;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setDeleting(true);
    await deleteProduct(product.id);
    window.location.reload();
  };

  if (listView) {
    return (
      <div className={styles.listRow}>
        <div className={styles.listImage}>
          {displayImage ? (
            <img src={displayImage} alt={product.name} className={styles.listImg} />
          ) : (
            <div className={styles.listPlaceholder} />
          )}
        </div>
        <div className={styles.listName}>{product.name}</div>
        <div className={styles.listPrice}>{formattedPrice}</div>
        <div className={styles.listActions}>
          <button type="button" className={styles.listAction} onClick={handleCopy} aria-label="Copy link">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button type="button" className={styles.listAction} onClick={handleShare} aria-label="Share">
            <Share2 size={14} />
          </button>
          <a href={`/products/${product.id}/edit`} className={styles.listAction} aria-label="Edit">
            <Pencil size={14} />
          </a>
          <button
            type="button"
            className={`${styles.listAction} ${styles.listDelete}`}
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {displayImage ? (
          <img src={displayImage} alt={product.name} className={styles.image} />
        ) : (
          <div className={styles.placeholder}>No image</div>
        )}
      </div>
      <div className={styles.bottomRow}>
        <div className={styles.content}>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.price}>{formattedPrice}</p>
        </div>
        <div className={styles.cardActions}>
          <button
            type="button"
            className={styles.cardAction}
            onClick={handleCopy}
            aria-label="Copy link"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button
            type="button"
            className={styles.cardAction}
            onClick={handleShare}
            aria-label="Share"
          >
            <Share2 size={14} />
          </button>
          <a href={`/products/${product.id}/edit`} className={styles.cardAction} aria-label="Edit">
            <Pencil size={14} />
          </a>
          <button
            type="button"
            className={`${styles.cardAction} ${styles.cardDelete}`}
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
