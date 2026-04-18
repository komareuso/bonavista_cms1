import { drizzle } from 'drizzle-orm/mysql2';
import { count, desc, eq } from 'drizzle-orm';
import { yachtPhotos, yachts } from '../drizzle/schema';

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
  })
  .from(yachts)
  .orderBy(desc(yachts.updatedAt));

const enriched = await Promise.all(
  rows.map(async (row) => {
    const [photoCountRow] = await db
      .select({ value: count() })
      .from(yachtPhotos)
      .where(eq(yachtPhotos.yachtId, row.id));

    return {
      ...row,
      photoCount: Number(photoCountRow?.value ?? 0),
    };
  }),
);

console.log(JSON.stringify(enriched, null, 2));
