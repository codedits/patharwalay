Patthar Walay — a classical, elegant and modern gemstone storefront built with Next.js and Tailwind CSS.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000` to view the site. The app router is used under `app/`.

## Project Structure

- `app/layout.tsx`: Global shell with Navbar and Footer
- `app/page.tsx`: Home page with hero and featured products
- `app/products/page.tsx`: Products listing with client-side search
- `app/products/[slug]/page.tsx`: Product detail placeholder route
- `app/globals.css`: Tailwind and theme tokens
- `next.config.ts`: Remote image domains (Unsplash, Cloudinary)

## Styling & Theme

Tailwind CSS v4 is configured. Theme tokens for foreground/background, muted, and accent colors provide a classic luxury feel (warm gold, deep teal). You can tweak them in `app/globals.css`.

## Data & Media (Planned)

- MongoDB: Replace in-memory arrays with server actions or route handlers that read from MongoDB.
- Cloudinary: Replace Unsplash URLs with Cloudinary assets. Add your `res.cloudinary.com/<cloud_name>` domain to `next.config.ts` if different.

## Admin Dashboard

- Visit `/admin` to create and manage products.
- API routes: `POST /api/products`, `GET /api/products`, `GET/PUT/DELETE /api/products/[id]`.
- Configure environment:

```bash
MONGODB_URI="your-mongodb-connection-string"
MONGODB_DB=patharwalay
```

Notes:
- The project already contains a small MongoDB helper in `lib/db.ts` and a `Product` Mongoose model in `models/Product.ts`.
- The admin UI at `/admin` POSTs to `/api/products` which will persist documents to MongoDB when `MONGODB_URI` is set.

Troubleshooting:
- If you see connection errors, confirm `MONGODB_URI` is correct and your IP or network is allowed by the Atlas cluster.
- Check the server logs in the terminal where `npm run dev` is running for Mongoose errors.

## Next Steps

- Hook up real product data (MongoDB models, server actions)
- Add cart and checkout flow
- Add categories/filters and pagination
- Add authentication for admin and customer areas

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — start production server
- `npm run lint` — run ESLint
