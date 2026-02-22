# ShahidRa Rentals - Implementation Worklog

## Project Overview
A peer-to-peer ethnic outfit rental marketplace where locals can list outfits for rent and others can book them. The platform handles trust via a refundable deposit system locked by OTP, location-based discovery, event-based filtering, and review with media.

## Technology Stack
- Frontend: Next.js 16 with App Router, TypeScript, Tailwind CSS, shadcn/ui
- Backend: Next.js API Routes, Prisma ORM
- Database: SQLite (development) / Supabase PostgreSQL (production)
- Payments: Razorpay integration (ready for integration)
- Maps: Google Maps API for Near Me feature
- Storage: Local storage (dev), Azure Blob (production)

---

## How to Access Admin Panel

### Method: Shield Button
1. Scroll to the very bottom of the home page
2. Find the text **"Tap 5 times for Admin"** with a shield icon
3. **Tap it 5 times quickly** (within 2 seconds)
4. Admin login modal will appear

### Admin Credentials
- **Email:** `admin@shahidra.com`
- **Password:** `admin123`

### Admin Features
- Dashboard with stats (users, listings, bookings, revenue, disputes)
- User management (view, ban, hold selling, IP history)
- Listings management (approve, reject, pause)
- Bookings management
- Disputes management
- Platform settings (fees, deposits, referrals, feature flags)
- Push notifications sender

---

## API Endpoints

### Listings
- `GET /api/listings` - Get all listings with filters
- `POST /api/listings` - Create new listing
- **Validation:** Query params and body validated with Zod
- **Error Handling:** Comprehensive error responses with details

### Bookings
- `GET /api/bookings` - Get bookings (user or seller)
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings` - Update status, verify OTP

### Users
- `GET /api/users` - Get current user
- `PUT /api/users` - Update user profile
- `PATCH /api/users` - Partial update

### Reviews
- `GET /api/reviews` - Get reviews with filters
- `POST /api/reviews` - Create review
- `PATCH /api/reviews` - Vote on review

### Admin
- `GET /api/admin` - Dashboard statistics
- `PATCH /api/admin` - User actions (ban, hold, verify)
- `PUT /api/admin` - Listing actions (approve, reject, pause)

---

## Backend Error Handling

All API routes include:
- **Input Validation:** Zod schemas for all inputs
- **Type Safety:** TypeScript strict mode
- **Safe Parsing:** Number parsing with fallbacks
- **Database Transactions:** Atomic operations with Prisma
- **Error Responses:** Consistent error format with details
- **Rate Limiting:** Ready for implementation
- **CORS:** Configured for production

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }  // Optional validation details
}
```

---

## Mobile Responsiveness

### Features
- **Touch-friendly:** All buttons have min 44x44px touch targets
- **Safe Areas:** iOS safe area insets handled
- **No Zoom on Focus:** 16px minimum font for inputs
- **Smooth Scrolling:** Native feel on mobile
- **Horizontal Scroll:** Hidden scrollbars, touch scrolling
- **Fixed Elements:** Bottom nav respects safe areas

### CSS Classes
- `.pb-safe` - Bottom padding with safe area
- `.pt-safe` - Top padding with safe area
- `.touch-scroll` - Smooth touch scrolling
- `.scrollbar-hide` - Hidden scrollbars
- `.no-pull-refresh` - Disable pull-to-refresh

---

## Mock Data

Run `bun run db:seed` to seed database with:
- **6 users** (sellers and customers)
- **10 listings** (various categories)
- **Admin configuration** settings
- **Feature flags**

---

## Switching to Supabase (Production)

Update `.env`:
```env
# Option 1: Direct connection
DATABASE_URL="postgresql://postgres:CaSUQOVJUtYPSjXw@db.akbtfhmxutnrpoetsyzw.supabase.co:5432/postgres"

# Option 2: Connection pooler (recommended)
DATABASE_URL="postgresql://postgres.akbtfhmxutnrpoetsyzw:CaSUQOVJUtYPSjXw@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
```

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Run:
```bash
bun run db:push
bun run db:seed
```

---

## Push to GitHub

```bash
# Create new repo on GitHub first
git remote add origin https://github.com/YOUR_USERNAME/shahidra-rentals.git
git push -u origin master
```

---

## Feature Flags (Admin Configurable)

- Platform fee percentage
- Minimum deposit amount
- Deposit release hours
- Max search radius
- Referral program enabled/disabled
- Referral discount percentage
- Referral credit amount
- AR Try-On enabled/disabled

---

*Last updated: Backend made robust with validation, mobile responsive*
