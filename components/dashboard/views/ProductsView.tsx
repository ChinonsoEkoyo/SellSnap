'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Plus, LayoutGrid, List, Search, SlidersHorizontal } from 'lucide-react';

import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { CreateProductOverlay } from '@/components/product/CreateProductOverlay';
import { EditProductOverlay } from '@/components/product/EditProductOverlay';
import { DeleteProductModal } from '@/components/product/DeleteProductModal';
import styles from './ProductsView.module.css';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  imageUrls: string | null;
  slug: string;
  stockType: string;
  stockQuantity: number | null;
  isPublished: boolean;
  createdAt: Date;
}

interface ProductsContentProps {
  products: Product[];
}

export function ProductsView({ products: initialProducts }: ProductsContentProps) {
  const [products, setProducts] = useState(initialProducts);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [showCreateOverlay, setShowCreateOverlay] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setShowCreateOverlay(true);
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('create');
      const query = newParams.toString();
      router.replace(query ? `?${query}` : pathname);
    }
  }, [searchParams, router, pathname]);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }, [products, search]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.description}>
            Manage your products and their shareable links.
          </p>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Button onClick={() => setShowCreateOverlay(true)}>
            <Plus size={16} />
            Add Product
          </Button>
        </div>
        
        <div className={styles.toolbarRight}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search products..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="button" className={styles.filterButton} aria-label="Filter">
            <SlidersHorizontal size={16} />
          </button>
          <div className={styles.viewToggle}>
            <button
              type="button"
              className={`${styles.viewButton} ${view === 'grid' ? styles.viewActive : ''}`}
              onClick={() => setView('grid')}
              aria-label="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              className={`${styles.viewButton} ${view === 'list' ? styles.viewActive : ''}`}
              onClick={() => setView('list')}
              aria-label="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          {search ? (
            <p className={styles.emptyText}>
              No products match &quot;{search}&quot;.
            </p>
          ) : (
            <>
              <p className={styles.emptyText}>No products yet.</p>
              <p className={styles.emptySubtext}>
                Create your first product to start selling.
              </p>
            </>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className={styles.grid}>
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={(p) => setEditingProduct(p as Product)}
              onDelete={(p) => setDeletingProduct(p as Product)}
            />
          ))}
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              listView
              onEdit={(p) => setEditingProduct(p as Product)}
              onDelete={(p) => setDeletingProduct(p as Product)}
            />
          ))}
        </div>
      )}

      {showCreateOverlay && (
        <CreateProductOverlay
          onClose={() => setShowCreateOverlay(false)}
          onProductCreated={(product) => setProducts((prev) => [product, ...prev])}
        />
      )}

      {editingProduct && (
        <EditProductOverlay
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onProductUpdated={(updated) => {
            setProducts((prev) =>
              prev.map((p) =>
                p.id === updated.id
                  ? { ...p, ...updated, createdAt: p.createdAt, isPublished: p.isPublished }
                  : p,
              ),
            );
            setEditingProduct(null);
          }}
        />
      )}

      {deletingProduct && (
        <DeleteProductModal
          product={deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onDeleted={() => setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id))}
        />
      )}
    </div>
  );
}