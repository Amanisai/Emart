# E-Mart (Full Stack Ecommerce)

React + Vite frontend with an Express + SQLite backend API (JWT auth, products, orders, Stripe Checkout).
## Tech Stack

- React 18
- Vite
- Express
- SQLite (better-sqlite3)
- JWT auth
- Stripe Checkout (test mode)

## Features

### Landing / Home

- Animated hero section (gradient background + floating particles)
- CTA buttons: Shop Now, Explore Categories

- Auto-sliding offers banner
- Typing animation text

- Category cards (Electronics, Fashion, Groceries, Accessories)

### Product List Page

- Grid/List view toggle
- Filters: category, price range slider, rating, availability

- Sorting: Price Low → High, Newest, Best Rating
- Skeleton loaders + empty state animation

### Product Card

- Shows image, title, price + discount, rating, stock status

- Hover effects (scale + shadow)
- Actions: Add to Cart, Wishlist, Quick View (modal)

### Product Details Page

- Image zoom on hover

- Image carousel (uses available images; falls back to single image)
- Tabs: Description, Specifications, Reviews

- Quantity selector
- Related products

### Cart Page

- Quantity increase/decrease

- Remove item
- Coupon code (demo: `SAVE10`)

- Price breakdown: subtotal, discount, tax, final total

### Wishlist Page

- Persistent wishlist (localStorage)
- Move to cart + remove

### Authentication

- Real JWT login/signup via backend API
- Protected routes for user dashboard and admin panel
- Role support (admin/user)

### Payments

- Stripe Checkout Session creation (server-side)
- Return URL verification (server-side)
- Webhook handler (optional)

## Routes

- `/` Landing
- `/products` Product list

- `/product/:type/:id` Product details
- `/cart` Cart

- `/wishlist` Wishlist
- `/login`, `/signup`, `/forgot` Auth

- `/profile` Protected profile dashboard
- `/admin` Protected admin panel (admin-only)

## Getting Started

1) Install dependencies

```bash
npm install
```

2) Create env file

- Copy `.env.example` → `.env`
- Fill `JWT_SECRET` and (for payments) `STRIPE_SECRET_KEY`
- (Optional) Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to seed an initial admin user

3) Run full stack (API + frontend)

```bash
npm run dev
```

Useful commands:

- Frontend only: `npm run dev:client`
- API only: `npm run dev:server`

## Screenshots

- Add screenshots in `README.md` once deployed.

## Notes

- The API defaults to port `5176` (see `.env.example`).
- The frontend proxies `/api/*` to the backend via `vite.config.js`.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
