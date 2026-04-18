import mysql from 'mysql2/promise';

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is not set');
}

const connection = await mysql.createConnection(url);

const [tables] = await connection.query(
  `SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = DATABASE()
     AND table_name IN ('yacht_pricing_tiers', 'yacht_extra_fees', 'yacht_included_services', 'yacht_equipment')
   ORDER BY table_name`,
);

const [columns] = await connection.query(
  `SELECT column_name
   FROM information_schema.columns
   WHERE table_schema = DATABASE()
     AND table_name = 'yachts'
     AND column_name IN (
       'marinaName', 'city', 'country', 'berthLocationText', 'rentalType', 'minimumOrderHours',
       'lengthValue', 'beamValue', 'draftValue', 'yearBuilt', 'modelName', 'boatCategory',
       'toiletsCount', 'engineSpec', 'currency', 'pricingMode', 'basePriceLabel', 'vatIncluded',
       'pricingNotes', 'heroBadge', 'bookingHelpText', 'extraServiceNotes', 'rulesNotes',
       'reviewCount', 'similarBoatsEnabled'
     )
   ORDER BY column_name`,
);

console.log(JSON.stringify({ tables, columns }, null, 2));

await connection.end();
