# EarnHub Platform

## Current State
EarnHub is a mobile-first subscription earning platform with Motoko backend and React/TypeScript frontend. Previous version (v20) had all features implemented but the draft expired.

## Requested Changes (Diff)

### Add
- Nothing new — full rebuild of existing feature set

### Modify
- Rebuild the complete app with all existing features intact

### Remove
- Nothing

## Implementation Plan

### Backend (Motoko)
- User authentication (mobile number + OTP simulation)
- Subscription plan management (Basic ₹500/₹150 daily 60 days, Standard ₹1000/₹300 daily 60 days, Premium ₹1750/₹750 daily 120 days)
- Wallet: balance tracking per user, defaults to ₹0
- Deposit management: store deposit requests with UTR/transaction ID, admin approval flow
- Withdrawal management: store withdrawal requests with UPI ID, admin approval
- Referral system: track referrer/referee relationships, auto-credit ₹500 bonus when referred user's Basic Plan (₹500) deposit is approved
- Admin panel backend: list users, approve/reject deposits and withdrawals, manage plans
- Notification data: static offer notifications per user

### Frontend (React + TypeScript)
- **Mobile-first UI** with bottom navigation bar
- **Auth page**: mobile number input + OTP verification (simulated)
- **Home page**: welcome header with notification bell (clickable, shows 3 offer messages with New badge + Mark All Read), Available Plans section (Basic, Standard, Premium cards with Buy Now button), no loading skeletons — plans show instantly with fallback data
- **Payment modal**: triggered by Buy Now — shows static UPI QR code image only (no camera scanner), payment app logos (PhonePe, Google Pay, Paytm), UTR/Transaction ID manual entry field
- **Deposit page**: static UPI QR code display, UTR manual entry, deposit history
- **Wallet page**: balance (defaults ₹0, updates after deposit), earnings tracker, active plans
- **Withdraw page**: withdrawal request form (UPI ID input, amount), withdrawal history (shows spinner only during actual fetch, shows user's own withdrawals only, shows 'No withdrawals yet' if empty)
- **Referral page** (gift icon in bottom nav): unique referral link copy button, referral earnings display, how-it-works explanation (₹500 bonus when referred user buys Basic Plan)
- **Profile page**: user info
- **Admin page** at `/admin` (credentials: admin/admin123): tabs for Users, Plans, Deposits, Withdrawals; withdrawal requests show user UPI ID in bold orange box with Copy button
- Bottom navigation: Home, Wallet, Deposit, Referral, Profile tabs
- All UI fully in English
- Payment logos: real PhonePe, Google Pay, Paytm generated logo images

### Assets
- UPI QR code: `src/frontend/public/assets/upi-qr.jpg` (existing)
- Payment logos: already generated in `src/frontend/public/assets/generated/`
  - `googlepay-logo-transparent.dim_100x100.png`
  - `paytm-logo-transparent.dim_100x100.png`
  - `phonepe-logo-transparent.dim_100x100.png`
