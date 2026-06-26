## Task: Fix Payment System + Production Readiness + Security Audit

### Overview
Fix the payment system (Razorpay), add coupon codes, fix verification, and prepare the application for production use by millions of users. Find and fix all bugs, security issues, and missing features.

### Project Location
- Working directory: `C:\auto_skillplace\skillplace`
- Real path: `D:\web software developement\skillplaceacademy\skillplace`

### Current Issues Found

#### 1. Payment: Receipt Length Error
- Error: `receipt: the length must be no more than 40`
- Fix: Shorten the receipt ID to max 40 characters

#### 2. Payment Verification Failing
- `/api/programs/verify-payment` route needs proper signature verification
- Need to verify the flow: create-order → Razorpay checkout → verify-payment → enrollment

#### 3. Coupon Code System
- Need to add coupon code apply/verify in the payment flow
- Coupons table already exists in schema
- Need to validate coupon (expiry, usage limit, discount calculation)

#### 4. Payment in Admin Dashboard
- Admin should see all payment records
- Payment status tracking (pending, completed, failed, refunded)

#### 5. Security Issues to Fix

**A. Exposed Secrets**
- Check all API routes use `adminSupabase` (service role key) not `anonSupabase`
- Ensure `.env.local` is never exposed to client
- Check that service role key is only used server-side

**B. Input Validation**
- All API routes must validate inputs
- Amount must be positive number
- Email validation
- Required field checks

**C. Row Level Security**
- All tables must have RLS enabled
- Users can only read/write their own data
- Admin routes bypass RLS via service role key
- Check: profiles, enrollments, payments, user_sessions, test_attempts, lesson_progress

**D. Rate Limiting**
- Add rate limiting to: create-order, verify-payment, login endpoints
- Use in-memory rate limiting (simple counter per IP/user)

**E. Password Security**
- Enforce strong password (min 8 chars, uppercase, lowercase, number, special char)
- Check password validation in sign-up flow

#### 6. Full Purchase Flow Fix
The complete flow should work:
1. User views program → clicks "Enroll Now"
2. Selects coupon code (optional) → applies discount
3. Clicks "Pay" → Razorpay order created
4. User pays via Razorpay
5. Payment verified → enrollment created with status='active'
6. User redirected to learning page
7. User can access course content

#### 7. Find and Fix All Bugs
- Check all API routes for error handling
- Check all client components for proper error states
- Check for any console.log statements (remove them)
- Check for any TODO comments (fix or implement)
- Check for unused imports
- Check for proper loading states

### Files to Review/Fix

1. `src/app/api/programs/create-order/route.ts` — Fix receipt length, add coupon validation
2. `src/app/api/programs/verify-payment/route.ts` — Fix verification logic
3. `src/app/api/programs/enroll/route.ts` — Fix enrollment creation
4. `src/app/programs/[slug]/enroll/page.tsx` — Fix payment flow UI
5. `src/app/api/admin/route.ts` — Ensure proper RLS bypass
6. `src/lib/auth.ts` — Add password strength validation
7. `src/lib/supabase/admin.ts` — Ensure service key usage
8. `src/app/api/programs/[slug]/route.ts` — Check program API
9. `src/app/admin-place/payments/page.tsx` — Payment dashboard (create if missing)
10. `src/components/courses/EnrollButton.tsx` — Fix enrollment button logic

### New Features to Add

**A. Coupon System**
- Validate coupon code against `coupons` table
- Check expiry date, usage limit
- Calculate discount (percentage or fixed amount)
- Show discounted price in payment modal

**B. Rate Limiting Helper**
- Create `src/lib/rate-limit.ts`
- Simple in-memory store: Map<ip, { count, resetTime }>
- Apply to: create-order (5/min), verify-payment (10/min), login (5/min)

**C. Admin Payment Dashboard**
- Show all payments with status
- Filter by status, date range
- Show revenue stats

### Security Checklist
- [ ] No secrets in client bundles
- [ ] All API routes validate inputs
- [ ] RLS enabled on all tables
- [ ] Service role key only in server files
- [ ] Rate limiting on sensitive endpoints
- [ ] Password strength enforced
- [ ] No console.log in production code
- [ ] Proper error handling everywhere

### DO NOT
- Do NOT git push
- Do NOT add new npm packages
- Do NOT break existing functionality
- Do NOT expose service role key to client

### After Completion
1. Run `npx tsc --noEmit` — fix ALL errors
2. Run `npm run build` — ensure build passes
3. Do NOT git push
