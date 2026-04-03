import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  public type PlanId = Nat;
  public type UTRNumber = Text;
  public type Date = Int;

  public type PaymentApp = {
    #PhonePe;
    #GooglePay;
    #Paytm;
  };

  public type Plan = {
    id : PlanId;
    name : Text;
    price : Nat;
    dailyEarning : Nat;
    validityDays : Nat;
  };

  public type ActivePlan = {
    planId : PlanId;
    activatedAt : Int;
    lastEarningsUpdate : Int;
  };

  public type User = {
    principal : Principal;
    mobile : Text;
    joinDate : Int;
    walletBalance : Nat;
    activePlan : ?ActivePlan;
  };

  public type PaymentSubmission = {
    user : Principal;
    planId : PlanId;
    paymentApp : PaymentApp;
    utrNumber : UTRNumber;
    status : { #pending; #approved; #rejected };
    submittedAt : Int;
  };

  public type WithdrawalRequest = {
    user : Principal;
    amount : Nat;
    upiId : Text;
    status : { #pending; #completed; #rejected };
    requestedAt : Int;
  };

  public type DepositRequest = {
    user : Principal;
    amount : Nat;
    utrNumber : UTRNumber;
    status : { #pending; #approved; #rejected };
    submittedAt : Int;
  };

  public type Testimonial = {
    author : Text;
    timestamp : Int;
    content : Text;
  };

  public type Link = {
    id : Nat;
    url : Text;
    title : Text;
    submittedBy : Text;
  };

  type OldState = {
    var nextPlanId : PlanId;
    var nextPaymentId : Nat;
    var nextWithdrawalId : Nat;
    var nextDepositId : Nat;
    plans : Map.Map<PlanId, Plan>;
    paymentSubmissions : Map.Map<Nat, PaymentSubmission>;
    withdrawalRequests : Map.Map<Nat, WithdrawalRequest>;
    depositRequests : Map.Map<Nat, DepositRequest>;
    users : Map.Map<Principal, User>;
    validated : Map.Map<UTRNumber, PlanId>;
  };

  type NewState = {
    var nextPlanId : PlanId;
    var nextPaymentId : Nat;
    var nextWithdrawalId : Nat;
    var nextDepositId : Nat;
    plans : Map.Map<PlanId, Plan>;
    paymentSubmissions : Map.Map<Nat, PaymentSubmission>;
    withdrawalRequests : Map.Map<Nat, WithdrawalRequest>;
    depositRequests : Map.Map<Nat, DepositRequest>;
    users : Map.Map<Principal, User>;
    validated : Map.Map<UTRNumber, PlanId>;
    testimonials : Map.Map<Nat, Testimonial>;
    links : Map.Map<Nat, Link>;
  };

  public type OldActor = {
    state : OldState;
    referredBy : Map.Map<Principal, Principal>;
    referralBonusPaid : Map.Map<Principal, Bool>;
    referralCount : Map.Map<Principal, Nat>;
    referralEarnings : Map.Map<Principal, Nat>;
  };

  public type NewActor = {
    state : NewState;
    referredBy : Map.Map<Principal, Principal>;
    referralBonusPaid : Map.Map<Principal, Bool>;
    referralCount : Map.Map<Principal, Nat>;
    referralEarnings : Map.Map<Principal, Nat>;
  };

  public func run(old : OldActor) : NewActor {
    {
      state = {
        var nextPlanId = old.state.nextPlanId;
        var nextPaymentId = old.state.nextPaymentId;
        var nextWithdrawalId = old.state.nextWithdrawalId;
        var nextDepositId = old.state.nextDepositId;
        plans = old.state.plans;
        paymentSubmissions = old.state.paymentSubmissions;
        withdrawalRequests = old.state.withdrawalRequests;
        depositRequests = old.state.depositRequests;
        users = old.state.users;
        validated = old.state.validated;
        testimonials = Map.empty<Nat, Testimonial>();
        links = Map.empty<Nat, Link>();
      };
      referredBy = old.referredBy;
      referralBonusPaid = old.referralBonusPaid;
      referralCount = old.referralCount;
      referralEarnings = old.referralEarnings;
    };
  };
};
