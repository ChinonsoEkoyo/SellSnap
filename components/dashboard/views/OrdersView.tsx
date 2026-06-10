'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

import { PageHeader } from '@/components/ui/PageHeader';
import styles from './OrdersView.module.css';

type OrderStatus = 'pending' | 'paid' | 'failed';

interface OrderProduct {
  name: string;
}

interface Order {
  id: string;
  buyerName: string;
  buyerEmail: string;
  amount: number;
  status: string;
  createdAt: Date;
  product: OrderProduct;
}

interface OrdersContentProps {
  orders: Order[];
}

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
  { key: 'failed', label: 'Failed' },
] as const;

export function OrdersView({ orders }: OrdersContentProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = orders;
    if (activeTab !== 'all') {
      result = result.filter((o) => o.status === activeTab);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.product.name.toLowerCase().includes(q) ||
          o.buyerName.toLowerCase().includes(q) ||
          o.buyerEmail.toLowerCase().includes(q),
      );
    }
    return result;
  }, [orders, activeTab, search]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <PageHeader
          title="Orders"
          description="View and manage all customer orders."
        />
      </div>

      <div className={styles.toolbar}>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className={styles.tabCount}>
                  {orders.filter((o) => o.status === tab.key).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search orders..."
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className={styles.emptyText}>
          {search
            ? `No orders match "${search}".`
            : 'No orders yet.'}
        </p>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Order ID</span>
            <span>Product</span>
            <span>Name</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Date</span>
          </div>
          {filtered.map((order) => (
            <div key={order.id} className={styles.tableRow}>
              <span className={styles.colId}>#{order.id.slice(-6).toUpperCase()}</span>
              <span className={styles.colProduct}>{order.product.name}</span>
              <span className={styles.colName}>{order.buyerName}</span>
              <span className={styles.colAmount}>
                ₦{(order.amount / 100).toLocaleString('en-NG')}
              </span>
              <span className={styles.colStatus}>
                <span className={`${styles.badge} ${styles[order.status] || ''}`}>
                  {order.status === 'paid' ? 'COMPLETED' : order.status.toUpperCase()}
                </span>
              </span>
              <span className={styles.colDate}>
                {new Date(order.createdAt).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
