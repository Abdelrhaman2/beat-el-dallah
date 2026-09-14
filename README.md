# بيت الدلة | Beit El Dallah — Specialty Coffee & Cafe Supplies E-Commerce

A production-grade e-commerce web application for **Beit El Dallah (بيت الدلة)**, an Egyptian specialty coffee roaster and cafe supplies store.

---

## Key Features

1. **WhatsApp Handoff Checkout (No Gateway Fees)**:
   - Customers fill their delivery info (27 Egyptian governorates, name, phone, address).
   - Order is validated and saved **server-side in PostgreSQL** first (status = `pending`) via Supabase Service Role Key.
   - Computes partial deposit required (default: 25%, fully editable in Admin Settings).
   - Automatically builds pre-filled, formatted WhatsApp message with **length safeguard** (switches to summary format for orders > 6 items or > 1,500 characters to prevent `wa.me` URL truncation).
   - Opens WhatsApp chat and displays confirmation page reminding customer to send transfer receipt (InstaPay / Vodafone Cash).

2. **Bilingual & Mirroring (Arabic / English)**:
   - Full RTL/LTR layout mirroring (margins, icons, chevrons, cart drawer).
   - Styled with Google Fonts: **Cairo** for Arabic and **Outfit** for Latin text.

3. **Centralized Brand Tokens**:
   - Palette and logo defined via semantic CSS variables in `globals.css` and tokens in `tailwind.config.ts` for instant re-branding in a single file.

4. **Dedicated & Isolated Admin Panel**:
   - Isolated at `/admin/login` (not linked anywhere on the public storefront).
   - Real **server-side pagination** on Orders table (25 per page with SQL filters).
   - Full CRUD on Products, Categories, and Coupons.
   - Real-time Settings manager (Deposit percentage, WhatsApp number, Payment instructions).
   - Sales analytics and CSV export.

5. **Relational Database with Strict Security**:
   - PostgreSQL hosted on Supabase.
   - Strict Row Level Security: **zero public insert** permissions on `orders` and `order_items`; inserts exclusively processed by `/api/orders` via Service Role Key.
   - Comprehensive performance indexes on `category_id`, `status`, `is_active`, and `created_at`.

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Database & Auth**: PostgreSQL via Supabase
- **State Management**: Zustand with `localStorage` persistence for guest carts
- **Typography**: Cairo (Arabic) + Outfit (English)
- **Deployment**: Vercel (Frontend & Serverless Handlers) + Supabase (PostgreSQL & Storage)

---

## Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node.js v23)
- npm or pnpm

### 2. Installation
```bash
# Clone repository and navigate to project directory
cd "d:/Beat dalla"

# Install dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env.local` and set your Supabase project keys:
```bash
cp .env.example .env.local
```

Example `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://oymfimtltmuyuwdmditq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

NEXT_PUBLIC_DEFAULT_WHATSAPP=201012345678
NEXT_PUBLIC_DEFAULT_DEPOSIT_PERCENT=25
ADMIN_SECRET_PASSCODE=dallah2026admin
```

### 4. Database Setup & Migrations
The initial migration is located in `supabase/migrations/001_initial_schema.sql`. You can execute it directly in the Supabase SQL Editor or run:
```bash
npm run db:seed
```

### 5. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront.
Open [http://localhost:3000/admin](http://localhost:3000/admin) to access the admin portal (Passcode: `dallah2026admin`).

---

## Production Build & Verification

```bash
npm run build
npm run start
```
