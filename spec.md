# EarnHub Platform

## Current State
Full rebuild from scratch. Previous version expired. All features need to be re-implemented based on project history.

## Requested Changes (Diff)

### Add
- Full EarnHub platform rebuild with all features from previous versions

### Modify
- N/A (fresh rebuild)

### Remove
- N/A

## Implementation Plan

### Backend (Motoko)
- User registration and authentication (mobile number + OTP simulation)
- Subscription plans management (Basic ₹500/₹150/day/60days, Standard ₹1000/₹300/day/60days, Premium ₹1750/₹750/day/120days)
- Auto-seed plans on first load
- Deposit/transaction management with UTR/Transaction ID
- Wallet balance tracking (default ₹0, updates after deposit approval)
- Withdrawal request management with UPI ID
- Admin panel with credentials admin/admin123
- Referral system: unique referral links, ₹500 bonus when referred user buys Basic Plan and admin approves
- Daily earnings calculation and crediting

### Frontend
- Mobile-first PWA design
- Login page: mobile number input + OTP
- Home page: wallet balance, available plans, quick actions
- Plans display: always show instantly (no loading skeletons), fallback hardcoded plans
- Deposit page: static UPI QR code image display, UTR/Transaction ID manual entry, payment app logos (PhonePe, Google Pay, Paytm)
- Buy Now modal: static QR code only (no camera scanner)
- Wallet page: balance, earnings history
- Withdrawal page: UPI ID input, withdrawal history (user-specific only)
- Referral tab (gift icon in bottom nav): copy referral link, earnings display
- Notification bell (top left): clickable, shows offer messages with New badge, Mark all read
- Admin panel at /admin (admin/admin123):
  - Users management
  - Plans management (add/edit/delete)
  - Deposits/transactions approval (shows UTR)
  - Withdrawals approval (shows UPI ID in bold orange box with Copy button)
- Bottom navigation: Home, Wallet, Deposit, Referral tabs
- All UI text in English only (no Hindi/Hinglish)
