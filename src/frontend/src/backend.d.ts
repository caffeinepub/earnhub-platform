import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface UserProfile {
    joinDate: bigint;
    mobile: string;
    walletBalance: bigint;
    activePlan?: ActivePlan;
}
export interface Plan {
    id: PlanId;
    name: string;
    dailyEarning: bigint;
    validityDays: bigint;
    price: bigint;
}
export interface FileContent {
    blob: ExternalBlob;
    name: string;
}
export interface User {
    principal: Principal;
    joinDate: bigint;
    mobile: string;
    walletBalance: bigint;
    activePlan?: ActivePlan;
}
export interface ActivePlan {
    planId: PlanId;
    activatedAt: bigint;
    lastEarningsUpdate: bigint;
}
export interface PaymentSubmission {
    status: Variant_pending_approved_rejected;
    planId: PlanId;
    user: Principal;
    submittedAt: bigint;
    utrNumber: UTRNumber;
    paymentApp: PaymentApp;
}
export interface DepositRequest {
    status: Variant_pending_approved_rejected;
    user: Principal;
    submittedAt: bigint;
    utrNumber: UTRNumber;
    amount: bigint;
}
export interface WithdrawalRequest {
    status: Variant_pending_completed_rejected;
    user: Principal;
    upiId: string;
    amount: bigint;
    requestedAt: bigint;
}
export interface Link {
    id: bigint;
    url: string;
    title: string;
    submittedBy: string;
}
export type PlanId = bigint;
export type UTRNumber = string;
export interface Testimonial {
    content: string;
    author: string;
    timestamp: bigint;
}
export enum PaymentApp {
    Paytm = "Paytm",
    PhonePe = "PhonePe",
    GooglePay = "GooglePay"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_approved_rejected {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum Variant_pending_completed_rejected {
    pending = "pending",
    completed = "completed",
    rejected = "rejected"
}
export interface backendInterface {
    addFile(name: string, blob: ExternalBlob): Promise<void>;
    addLink(url: string, title: string, submittedBy: string): Promise<void>;
    addPlan(name: string, price: bigint, dailyEarning: bigint, validityDays: bigint): Promise<PlanId>;
    addTestimonial(author: string, content: string): Promise<void>;
    approveDepositRequest(depositId: bigint): Promise<void>;
    approvePaymentSubmission(paymentId: bigint): Promise<void>;
    approveWithdrawalRequest(withdrawalId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    ensureDefaultPlans(): Promise<void>;
    getAllDepositRequests(): Promise<Array<DepositRequest>>;
    getAllFiles(): Promise<Array<FileContent>>;
    getAllPaymentSubmissions(): Promise<Array<PaymentSubmission>>;
    getAllPlans(): Promise<Array<Plan>>;
    getAllWithdrawalRequests(): Promise<Array<WithdrawalRequest>>;
    getCallerDepositRequests(): Promise<Array<DepositRequest>>;
    getCallerProfileWithEarnings(): Promise<User>;
    getCallerReferralStats(): Promise<{
        totalReferrals: bigint;
        totalEarnings: bigint;
    }>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFile(name: string): Promise<FileContent | null>;
    getLinks(): Promise<Array<Link>>;
    getTestimonialByAuthor(author: string): Promise<Testimonial | null>;
    getTestimonials(): Promise<Array<Testimonial>>;
    getUserProfile(targetUser: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(mobile: string): Promise<void>;
    rejectDepositRequest(depositId: bigint): Promise<void>;
    rejectPaymentSubmission(paymentId: bigint): Promise<void>;
    rejectWithdrawalRequest(withdrawalId: bigint): Promise<void>;
    requestDeposit(amount: bigint, utrNumber: UTRNumber): Promise<void>;
    requestPlanPurchase(planId: PlanId, paymentApp: PaymentApp, utrNumber: UTRNumber): Promise<void>;
    requestWithdrawal(amount: bigint, upiId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setReferredBy(referralPrincipal: string): Promise<void>;
    updatePlan(planId: PlanId, name: string, price: bigint, dailyEarning: bigint, validityDays: bigint): Promise<Plan>;
}
