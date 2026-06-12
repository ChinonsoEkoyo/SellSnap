import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TrendIndicator } from '@/components/dashboard/TrendIndicator';
import styles from './page.module.css';

export default async function DashboardPage() {
  const session = await getSession();
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Active Products
  const activeProductCount = await db.product.count({
    where: { 
      userId: session?.user?.id,
      isPublished: true 
    }
  });

  const prevActiveProductCount = await db.product.count({
    where: { 
      userId: session?.user?.id,
      isPublished: true,
      createdAt: { lt: thirtyDaysAgo }
    }
  });

  const userProductIds = (await db.product.findMany({
    where: { userId: session?.user?.id },
    select: { id: true },
  })).map((p: { id: string }) => p.id);

  // Recent Orders
  const orders = await db.order.findMany({
    where: { productId: { in: userProductIds } },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { product: true }
  });

  const totalOrdersCount = await db.order.count({
    where: { productId: { in: userProductIds } }
  });

  const currentPeriodOrders = await db.order.count({
    where: { 
      productId: { in: userProductIds },
      createdAt: { gte: thirtyDaysAgo }
    }
  });

  const prevPeriodOrders = await db.order.count({
    where: { 
      productId: { in: userProductIds },
      createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
    }
  });

  // Total Revenue
  const totalRevenue = await db.order.aggregate({
    where: { 
      status: 'paid',
      productId: { in: userProductIds } 
    },
    _sum: { amount: true }
  });

  const currentRevenue = await db.order.aggregate({
    where: { 
      status: 'paid',
      productId: { in: userProductIds },
      createdAt: { gte: thirtyDaysAgo }
    },
    _sum: { amount: true }
  });

  const prevRevenue = await db.order.aggregate({
    where: { 
      status: 'paid',
      productId: { in: userProductIds },
      createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
    },
    _sum: { amount: true }
  });

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const revenueTrend = calculateTrend(currentRevenue._sum.amount || 0, prevRevenue._sum.amount || 0);
  const ordersTrend = calculateTrend(currentPeriodOrders, prevPeriodOrders);
  const productsTrend = calculateTrend(activeProductCount, prevActiveProductCount);

  return (
    <div className={styles.container}>
      <PageHeader 
        title="Dashboard Overview" 
        description={`Welcome back, ${session?.user?.name}`}
        actions={
          <Button asChild>
            <Link href="/dashboard/products?create=true">
              <Plus size={16} />
              Add product
            </Link>
          </Button>
        }
      />
      
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statLabel}>Total Revenue</div>
          <div className={styles.statValue}>
            ₦{((totalRevenue._sum.amount || 0) / 100).toLocaleString('en-NG')}
          </div>
          <TrendIndicator value={revenueTrend} />
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statLabel}>Active Products</div>
          <div className={styles.statValue}>{activeProductCount}</div>
          <TrendIndicator value={productsTrend} />
        </Card>
        <Card className={styles.statCard}>
          <div className={styles.statLabel}>Total Orders</div>
          <div className={styles.statValue}>{totalOrdersCount}</div>
          <TrendIndicator value={ordersTrend} />
        </Card>
      </div>

      <div className={styles.recentOrders}>
        <h2 className={styles.sectionTitle}>Recent Orders</h2>
        {orders.length === 0 ? (
          <p className={styles.emptyText}>No orders yet.</p>
        ) : (
          <div className={styles.ordersList}>
            <div className={styles.ordersHeader}>
              <span>Order ID</span>
              <span>Product</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Date</span>
            </div>
            {orders.map(order => (
              <div key={order.id} className={styles.orderItem}>
                <div className={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</div>
                <div className={styles.orderProduct}>{order.product.name}</div>
                <div className={styles.orderAmount}>
                  ₦{(order.amount / 100).toLocaleString('en-NG')}
                </div>
                <div className={styles.orderStatus}>
                  <span className={`${styles.badge} ${styles[order.status]}`}>
                    {order.status === 'paid' ? 'COMPLETED' : order.status.toUpperCase()}
                  </span>
                </div>
                <div className={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString('en-NG', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}{' '}
                  {new Date(order.createdAt).toLocaleTimeString('en-NG', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  }).toLowerCase()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
