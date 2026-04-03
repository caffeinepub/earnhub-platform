# EarnHub Platform

## Current State
Full rebuild from scratch. Previous version (v19) expired.

## Requested Changes (Diff)

### Add
- Full EarnHub platform with all features from previous version

### Modify
- N/A (full rebuild)

### Remove
- N/A

## Implementation Plan

### Backend (Motoko)
- User registration and authentication (mobile number + OTP simulation)
- Subscription plans management (Basic ₹500/₹150 per day/60 days, Standard ₹1000/₹300 per day/60 days, Premium ₹1750/₹750 per day/120 days)
- Auto-seed plans on first load
- Deposit management: users submit UTR/Transaction ID, admin approves/rejects
- Wallet balance tracking (defaults to ₹0, updates on approved deposit)
- Withdrawal requests: users submit UPI ID + amount, admin processes
- Earnings tracking: daily earnings per active plan
- Referral system: unique referral code per user, track referrals, auto-credit ₹500 when referred user gets Basic Plan (₹500) approved
- Admin panel: manage users, plans, deposits, withdrawals
- Notification system: offer messages stored and served to users
- UPI QR code storage for payment display

### Frontend
- Mobile-first PWA design
- Authentication: mobile number entry + OTP screen (simulated)
- Home screen: wallet balance, available plans, bottom navigation
- Plans display: instant display with fallback (no loading skeletons)
- Buy Now flow: payment modal with static UPI QR code image only (no camera)
- Payment app logos: PhonePe, Google Pay, Paytm real logos shown
- Deposit page: static QR code display, UTR entry form
- Wallet/Earnings page: balance, active plans, earnings history
- Withdrawal page: UPI ID entry, amount, submission, own history only
- Referral tab: unique link copy button, earnings display, ₹500 bonus info
- Notification bell (top left): clickable, shows offer messages with New badge, Mark all read
- Admin panel at /admin (admin/admin123): users, plans, deposits, withdrawals tabs
- Admin withdrawal view: UPI ID in bold orange box with Copy button
- All text in English only
- Bottom navigation: Home, Wallet, Deposit, Referral, Profile icons
