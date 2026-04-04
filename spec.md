# EarnHub Platform

## Current State
App is fully functional with auth, plans, deposit, wallet, referral, admin panel. Navigation uses custom router with pushState. All UPI payment flows use static QR code image only — no camera scanner present. Actor hook triggers query invalidation on actor change.

## Requested Changes (Diff)

### Add
- Camera QR scanner tab to Deposit page (alongside existing static QR display)
- Camera QR scanner tab to PaymentModal plan purchase flow
- Scanner reads QR code and pre-fills UTR/transaction ID field if QR contains payment reference

### Modify
- Fix click/tap delay: navigation buttons feel slow because actor initialization and query invalidation causes excessive re-renders on every click. Fix by debouncing or removing unnecessary refetch on actor change.
- Deposit page: add tab switcher between "Scan QR" (camera scanner) and "Show QR" (existing static QR)
- PaymentModal: add tab switcher in QR step between "Scan QR" (camera) and "Show QR" (static)

### Remove
- Nothing removed; scanner is being added back per new user request

## Implementation Plan
1. Fix useActor.ts: remove the useEffect that calls invalidateQueries/refetchQueries on every actor change — this causes entire app re-render and input lag
2. Add inline camera QR scanner component using getUserMedia/BarcodeDetector API with jsQR fallback
3. DepositPage: add tab switcher — "Show QR" tab shows static QR, "Scan QR" tab shows camera scanner
4. PaymentModal: in the QR step, add tab switcher — "Show QR" tab shows static QR, "Scan QR" tab shows camera scanner
5. When scanner detects a QR/barcode, attempt to extract UTR from the result and auto-fill the UTR input
