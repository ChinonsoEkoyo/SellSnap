import { db } from '../lib/db';

async function main() {
  try {
    const user = await db.user.findFirst();
    console.log('Query successful:', user);
  } catch (err) {
    console.error('Query failed:', err);
  }
}
main();
