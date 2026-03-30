# EarnHub Platform

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Full user authentication system: signup with mobile number + password, simulated OTP (displayed on screen), login, logout, forgot password (simulated reset)
- Dashboard with wallet balance, subscription plan cards (₹500, ₹1000, ₹1750), bottom nav (Home, Wallet, Deposit, Withdraw, Profile)
- UPI Payment flow: select PhonePe/Google Pay/Paytm, show QR placeholder, enter UTR/transaction ID, pending status
- Admin panel at /admin: hardcoded credentials (admin/admin123), manage payments/withdrawals/deposits/plans
- Earnings system: daily earnings credited based on time elapsed since plan activation
- Withdrawal system: user requests via UPI ID, min ₹100, admin approves/rejects
- Deposit system: user submits amount + UTR, admin approves/rejects, credits wallet
- Profile screen: mobile number, active plan, join date, logout

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
- User record: id, mobile, hashedPassword, joinDate, walletBalance, activePlan (optional)
- Plan record: id, name, price, dailyEarning, validityDays
- PaymentSubmission: id, userId, planId, utrNumber, paymentApp, status (Pending/Approved/Rejected), submittedAt
- WithdrawalRequest: id, userId, amount, upiId, status (Pending/Completed/Rejected), requestedAt
- DepositRequest: id, userId, amount, utrNumber, status (Pending/Approved/Rejected), submittedAt
- ActivePlan: planId, activatedAt, totalEarned
- APIs: register, login, getProfile, updateWallet, submitPayment, submitWithdrawal, submitDeposit, getMySubmissions
- Admin APIs: getAllPayments, approvePayment, rejectPayment, getAllWithdrawals, approveWithdrawal, rejectWithdrawal, getAllDeposits, approveDeposit, rejectDeposit, getPlans, updatePlan
- Earnings calculation: on wallet fetch, compute days since activation * dailyEarning and update balance

### Frontend (React + TypeScript + Tailwind)
- React Router for navigation: /auth, /, /wallet, /deposit, /withdraw, /profile, /admin
- Auth context for session management (stored in localStorage)
- Mobile-first layout with max-width container and bottom nav
- Plan cards with buy now flow → UPI payment modal → UTR entry → confirmation
- Admin dashboard with tabs: Payments, Withdrawals, Deposits, Plans
- All currency in ₹ (Indian Rupee)
- Clean, modern mobile app feel with card-based UI
