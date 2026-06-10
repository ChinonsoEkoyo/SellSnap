'use server';

import { db } from '@/lib/db';

export async function testServerAction() {
  try {
    const users = await db.user.findMany({ take: 1 });
    return { success: true, users: users.map(u => u.email) };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : String(error),
    };
  }
}
