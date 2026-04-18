import { drizzle } from 'drizzle-orm/mysql2';
import { desc, sql } from 'drizzle-orm';
import { yachts } from '../drizzle/schema.ts';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is missing');
  process.exit(1);
}

const db = drizzle(process.env.DATABASE_URL);

const rows = await db
  .select({
    id: yachts.id,
    slug: yachts.slug,
    name: yachts.name,
    status: yachts.status,
    updatedAt: yachts.updatedAt,
    price: yachts.price,
    type: yachts.type,
    photoCount: sql`(select count(*) from yacht_photos p where p.yacht_id = ${yachts.id})`,
  })
  .from(yachts)
  .orderBy(desc(yachts.updatedAt));

console.log(JSON.stringify(rows, null, 2));
