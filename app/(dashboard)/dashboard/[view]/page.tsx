import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { ProductsView } from '@/components/dashboard/views/ProductsView';
import { OrdersView } from '@/components/dashboard/views/OrdersView';

interface DashboardViewPageProps {
  params: Promise<{ view: string }>;
}

export default async function DashboardViewPage({ params }: DashboardViewPageProps) {
  const { view } = await params;
  const session = await getSession();

  if (!session?.user?.id) {
    return null; // Should be handled by layout redirect
  }

  if (view === 'products') {
    const products = await db.product.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });
    return <ProductsView products={products} />;
  }

  if (view === 'orders') {
    const orders = await db.order.findMany({
      where: {
        product: { userId: session.user.id },
      },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    return <OrdersView orders={orders} />;
  }

  return notFound();
}
