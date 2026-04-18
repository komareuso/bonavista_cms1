# Bonavista Data Source Notes

The Bonavista CMS project uses the database as the single source of truth for all yacht content shown in both the public site and the protected manager interface.

| Surface | Source of data | Implementation note |
| --- | --- | --- |
| Public catalog (`/`) | `trpc.yachts.publicList` | The homepage renders only published yacht entries returned by the server router. |
| Public yacht page (`/experience/:slug`) | `trpc.yachts.publicBySlug` | The detail page reads one published yacht record from the database by slug. |
| Admin dashboard (`/admin`) | `trpc.yachts.dashboard` | Summary stats come from live counts in the database. |
| Admin fleet list (`/admin/yachts`) | `trpc.yachts.adminList` | Managers see current database entries with status and cover image data. |
| Admin yacht editor | `trpc.yachts.getEditor` and `trpc.yachts.save` | Editing writes directly to normalized yacht tables. |

No static `fleet.ts` source is used by the public catalog or experience page in this CMS project. Public-facing yacht content is loaded through server procedures backed by the Bonavista database.
