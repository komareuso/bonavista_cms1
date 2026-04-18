import { readFileSync } from "node:fs";
import mysql from "mysql2/promise";

async function main() {
  const raw = readFileSync("/home/ubuntu/bonavista_cms/scripts/temp_published_yacht.json", "utf-8");
  const { id } = JSON.parse(raw) as { id: number; slug: string };

  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  await connection.query("DELETE FROM yacht_equipment WHERE yachtId = ?", [id]);
  await connection.query("DELETE FROM yacht_extra_fees WHERE yachtId = ?", [id]);
  await connection.query("DELETE FROM yacht_included_services WHERE yachtId = ?", [id]);
  await connection.query("DELETE FROM yacht_pricing_tiers WHERE yachtId = ?", [id]);
  await connection.query("DELETE FROM yacht_amenities WHERE yachtId = ?", [id]);
  await connection.query("DELETE FROM yacht_details WHERE yachtId = ?", [id]);
  await connection.query("DELETE FROM yacht_features WHERE yachtId = ?", [id]);
  await connection.query("DELETE FROM yacht_custom_fields WHERE yachtId = ?", [id]);
  await connection.query("DELETE FROM yacht_photos WHERE yachtId = ?", [id]);
  await connection.query("DELETE FROM yachts WHERE id = ?", [id]);
  await connection.end();
  console.log(JSON.stringify({ deletedId: id }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
