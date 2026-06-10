'use client';

import { useState } from 'react';
import styles from './page.module.css';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return <div className={styles.placeholder}>No image</div>;
  }

  return (
    <>
      <div className={styles.mainImage}>
        <img src={images[selectedIndex]} alt={productName} className={styles.mainImg} />
      </div>
      {images.length > 1 && (
        <div className={styles.thumbs}>
          {images.map((url, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.thumb} ${i === selectedIndex ? styles.thumbActive : ''}`}
              onClick={() => setSelectedIndex(i)}
            >
              <img src={url} alt="" className={styles.thumbImg} />
            </button>
          ))}
        </div>
      )}
    </>
  );
}
