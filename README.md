
# Barcelo Biagi Storefront (Next.js)

Next.js app version of the Barcelo Biagi storefront with UploadThing-managed assets and Prisma/PostgreSQL APIs for products, categories, orders, settings, customers, and users.

## Setup

1. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` (use the Prisma-provided connection string)
   - `DIRECT_URL` (same as your direct DB URL if `DATABASE_URL` points to Prisma Accelerate/Data Proxy; required for migrations)
   - `UPLOADTHING_TOKEN` (UploadThing token; app IDs can stay blank if not provided)
2. Install deps: `npm install`
3. Generate Prisma client: `npm run prisma:generate`
4. Create/migrate your local database: `npm run prisma:migrate`
5. Start dev server: `npm run dev`
  
