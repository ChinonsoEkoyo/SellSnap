'use server';

import { nanoid } from 'nanoid';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { createProductSchema } from '@/lib/validators/product';

export type ProductFormState = {
  message: string;
  success?: boolean;
  product?: {
    id: string;
    name: string;
    slug: string;
  };
};

export async function createProduct(
  _previousState: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const session = await getSession();

  if (!session?.user?.id) {
    return { message: 'You must be signed in.' };
  }

  const imageUrl = formData.get('imageUrl') as string | null;
  const imageUrlsRaw = formData.get('imageUrls') as string | null;
  const stockType = formData.get('stockType') as string;
  const stockQuantity = formData.get('stockQuantity') as string | null;

  const parsed = createProductSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    stockType,
    stockQuantity: stockQuantity || undefined,
  });

  if (!parsed.success) {
    return { message: 'Check your product details and try again.' };
  }

  const { name, description, price } = parsed.data;

  try {
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${nanoid(8)}`;

    const product = await db.product.create({
      data: {
        userId: session.user.id,
        name,
        description: description || null,
        price: Math.round(price * 100),
        slug,
        imageUrl: imageUrl || null,
        imageUrls: imageUrlsRaw || null,
        stockType,
        stockQuantity: stockType === 'limited' && stockQuantity ? parseInt(stockQuantity, 10) : null,
        isPublished: true,
      },
    });

    return { message: '', success: true, product: { id: product.id, name: product.name, slug: product.slug } };
  } catch (error) {
    logger.error('product.create.failed', { error });
    return { message: 'Something went wrong. Please try again.' };
  }
}

export async function deleteProduct(productId: string): Promise<{ message: string }> {
  const session = await getSession();

  if (!session?.user?.id) {
    return { message: 'You must be signed in.' };
  }

  try {
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { userId: true },
    });

    if (!product || product.userId !== session.user.id) {
      return { message: 'Product not found.' };
    }

    await db.product.delete({ where: { id: productId } });
    return { message: '' };
  } catch (error) {
    logger.error('product.delete.failed', { error });
    return { message: 'Something went wrong. Please try again.' };
  }
}
