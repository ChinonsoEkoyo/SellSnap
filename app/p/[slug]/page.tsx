import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { ProductBuyForm } from './ProductBuyForm';
import { ProductGallery } from './ProductGallery';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug, isPublished: true },
  });

  if (!product) {
    notFound();
  }

  const images: string[] = product.imageUrls
    ? JSON.parse(product.imageUrls)
    : product.imageUrl
      ? [product.imageUrl]
      : [];

  return (
    <div className={styles.page}>
      <div className={styles.logo}>
        <Link href="/">
          <Image
            src="/images/SellSnapLogo.png"
            alt="SellSnap"
            width={120}
            height={27}
            priority
          />
        </Link>
      </div>
      <div className={styles.container}>
        <div className={styles.imageCol}>
          <ProductGallery images={images} productName={product.name} />
        </div>

        <div className={styles.formCol}>
          <h1 className={styles.name}>{product.name}</h1>
          {product.description && (
            <p className={styles.description}>{product.description}</p>
          )}
          <p className={styles.price}>
            {(product.price / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' })}
          </p>
          <ProductBuyForm
            productId={product.id}
            unitPrice={product.price}
            stockType={product.stockType}
            stockQuantity={product.stockQuantity}
            paystackPublicKey={process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ''}
          />
        </div>
      </div>
    </div>
  );
}
