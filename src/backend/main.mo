import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import List "mo:core/List";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  type PlanId = Nat;
  type UTRNumber = Text;
  type Date = Int;

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

  public type UserProfile = {
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

  // Internal State
  module State {
    public type State = {
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

    public func init() : State {
      {
        var nextPlanId = 1;
        var nextPaymentId = 1;
        var nextWithdrawalId = 1;
        var nextDepositId = 1;
        plans = Map.empty<PlanId, Plan>();
        paymentSubmissions = Map.empty<Nat, PaymentSubmission>();
        withdrawalRequests = Map.empty<Nat, WithdrawalRequest>();
        depositRequests = Map.empty<Nat, DepositRequest>();
        users = Map.empty<Principal, User>();
        validated = Map.empty<UTRNumber, PlanId>();
      };
    };
  };

  let state = State.init();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper function to get current timestamp in seconds
  func currentTime() : Int {
    Time.now() / 1_000_000_000;
  };

  // Calculate earnings based on days elapsed
  func calculateEarnings(user : User, plan : Plan, activePlan : ActivePlan) : (User, Nat) {
    let now = currentTime();
    let daysElapsed = Int.abs(now - activePlan.activatedAt) / 86400; // 86400 seconds = 1 day
    let daysSinceUpdate = Int.abs(now - activePlan.lastEarningsUpdate) / 86400;

    if (daysElapsed > plan.validityDays) {
      // Plan expired, no more earnings
      (user, 0);
    } else if (daysSinceUpdate > 0) {
      let eligibleDays = if (daysElapsed > plan.validityDays) {
        let remainingDays = plan.validityDays - Int.abs(activePlan.lastEarningsUpdate - activePlan.activatedAt) / 86400;
        Int.abs(remainingDays);
      } else {
        Int.abs(daysSinceUpdate);
      };
      
      let earnings = eligibleDays * plan.dailyEarning;
      let newBalance = user.walletBalance + earnings;
      let updatedUser : User = {
        user with
        walletBalance = newBalance;
        activePlan = ?{
          activePlan with
          lastEarningsUpdate = now;
        };
      };
      (updatedUser, eligibleDays);
    } else {
      (user, 0);
    };
  };

  // Update user earnings if they have an active plan
  func updateUserEarnings(user : User) : User {
    switch (user.activePlan) {
      case (null) { user };
      case (?activePlan) {
        switch (state.plans.get(activePlan.planId)) {
          case (null) { user };
          case (?plan) {
            let (updatedUser, _) = calculateEarnings(user, plan, activePlan);
            updatedUser;
          };
        };
      };
    };
  };

  // ADMIN FUNCTIONS
  public shared ({ caller }) func addPlan(name : Text, price : Nat, dailyEarning : Nat, validityDays : Nat) : async PlanId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add plans");
    };
    let planId = state.nextPlanId;
    state.nextPlanId += 1;

    let newPlan : Plan = {
      id = planId;
      name;
      price;
      dailyEarning;
      validityDays;
    };
    state.plans.add(planId, newPlan);
    planId;
  };

  public shared ({ caller }) func updatePlan(planId : PlanId, name : Text, price : Nat, dailyEarning : Nat, validityDays : Nat) : async Plan {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update plans");
    };
    switch (state.plans.get(planId)) {
      case (null) { Runtime.trap("Plan not found") };
      case (?existingPlan) {
        let updatedPlan : Plan = {
          existingPlan with
          name;
          price;
          dailyEarning;
          validityDays;
        };
        state.plans.add(planId, updatedPlan);
        updatedPlan;
      };
    };
  };

  public query ({ caller }) func getAllPlans() : async [Plan] {
    // Public - anyone can view available plans
    state.plans.values().toArray();
  };

  public query ({ caller }) func getAllPaymentSubmissions() : async [PaymentSubmission] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view payment submissions");
    };
    state.paymentSubmissions.values().toArray();
  };

  public query ({ caller }) func getAllWithdrawalRequests() : async [WithdrawalRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view withdrawal requests");
    };
    state.withdrawalRequests.values().toArray();
  };

  public query ({ caller }) func getAllDepositRequests() : async [DepositRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view deposit requests");
    };
    state.depositRequests.values().toArray();
  };

  public shared ({ caller }) func approvePaymentSubmission(paymentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve payment submissions");
    };
    switch (state.paymentSubmissions.get(paymentId)) {
      case (null) { Runtime.trap("Payment submission not found") };
      case (?submission) {
        if (submission.status != #pending) {
          Runtime.trap("Payment submission already processed");
        };
        
        // Update submission status
        let updatedSubmission : PaymentSubmission = {
          submission with status = #approved;
        };
        state.paymentSubmissions.add(paymentId, updatedSubmission);

        // Activate user's plan
        switch (state.users.get(submission.user)) {
          case (null) { Runtime.trap("User not found") };
          case (?user) {
            let now = currentTime();
            let activePlan : ActivePlan = {
              planId = submission.planId;
              activatedAt = now;
              lastEarningsUpdate = now;
            };
            let updatedUser : User = {
              user with activePlan = ?activePlan;
            };
            state.users.add(submission.user, updatedUser);
          };
        };
      };
    };
  };

  public shared ({ caller }) func rejectPaymentSubmission(paymentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject payment submissions");
    };
    switch (state.paymentSubmissions.get(paymentId)) {
      case (null) { Runtime.trap("Payment submission not found") };
      case (?submission) {
        if (submission.status != #pending) {
          Runtime.trap("Payment submission already processed");
        };
        let updatedSubmission : PaymentSubmission = {
          submission with status = #rejected;
        };
        state.paymentSubmissions.add(paymentId, updatedSubmission);
      };
    };
  };

  public shared ({ caller }) func approveWithdrawalRequest(withdrawalId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve withdrawal requests");
    };
    switch (state.withdrawalRequests.get(withdrawalId)) {
      case (null) { Runtime.trap("Withdrawal request not found") };
      case (?request) {
        if (request.status != #pending) {
          Runtime.trap("Withdrawal request already processed");
        };

        // Deduct from user wallet
        switch (state.users.get(request.user)) {
          case (null) { Runtime.trap("User not found") };
          case (?user) {
            if (user.walletBalance < request.amount) {
              Runtime.trap("Insufficient balance");
            };
            let updatedUser : User = {
              user with walletBalance = user.walletBalance - request.amount;
            };
            state.users.add(request.user, updatedUser);

            // Update request status
            let updatedRequest : WithdrawalRequest = {
              request with status = #completed;
            };
            state.withdrawalRequests.add(withdrawalId, updatedRequest);
          };
        };
      };
    };
  };

  public shared ({ caller }) func rejectWithdrawalRequest(withdrawalId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject withdrawal requests");
    };
    switch (state.withdrawalRequests.get(withdrawalId)) {
      case (null) { Runtime.trap("Withdrawal request not found") };
      case (?request) {
        if (request.status != #pending) {
          Runtime.trap("Withdrawal request already processed");
        };
        let updatedRequest : WithdrawalRequest = {
          request with status = #rejected;
        };
        state.withdrawalRequests.add(withdrawalId, updatedRequest);
      };
    };
  };

  public shared ({ caller }) func approveDepositRequest(depositId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve deposit requests");
    };
    switch (state.depositRequests.get(depositId)) {
      case (null) { Runtime.trap("Deposit request not found") };
      case (?request) {
        if (request.status != #pending) {
          Runtime.trap("Deposit request already processed");
        };

        // Credit user wallet
        switch (state.users.get(request.user)) {
          case (null) { Runtime.trap("User not found") };
          case (?user) {
            let updatedUser : User = {
              user with walletBalance = user.walletBalance + request.amount;
            };
            state.users.add(request.user, updatedUser);

            // Update request status
            let updatedRequest : DepositRequest = {
              request with status = #approved;
            };
            state.depositRequests.add(depositId, updatedRequest);
          };
        };
      };
    };
  };

  public shared ({ caller }) func rejectDepositRequest(depositId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reject deposit requests");
    };
    switch (state.depositRequests.get(depositId)) {
      case (null) { Runtime.trap("Deposit request not found") };
      case (?request) {
        if (request.status != #pending) {
          Runtime.trap("Deposit request already processed");
        };
        let updatedRequest : DepositRequest = {
          request with status = #rejected;
        };
        state.depositRequests.add(depositId, updatedRequest);
      };
    };
  };

  // USER FUNCTIONS
  public shared ({ caller }) func registerUser(mobile : Text) : async () {
    // Public - anyone can register
    if (state.users.containsKey(caller)) {
      Runtime.trap("User already registered");
    };
    let newUser : User = {
      principal = caller;
      mobile;
      joinDate = currentTime();
      walletBalance = 0;
      activePlan = null;
    };
    state.users.add(caller, newUser);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (state.users.get(caller)) {
      case (null) { null };
      case (?user) {
        ?{
          mobile = user.mobile;
          joinDate = user.joinDate;
          walletBalance = user.walletBalance;
          activePlan = user.activePlan;
        };
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (state.users.get(user)) {
      case (null) { null };
      case (?u) {
        ?{
          mobile = u.mobile;
          joinDate = u.joinDate;
          walletBalance = u.walletBalance;
          activePlan = u.activePlan;
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    switch (state.users.get(caller)) {
      case (null) { Runtime.trap("User not found. Please register first.") };
      case (?user) {
        let updatedUser : User = {
          user with
          mobile = profile.mobile;
          walletBalance = profile.walletBalance;
          activePlan = profile.activePlan;
        };
        state.users.add(caller, updatedUser);
      };
    };
  };

  public shared ({ caller }) func getCallerProfileWithEarnings() : async User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    switch (state.users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        let updatedUser = updateUserEarnings(user);
        state.users.add(caller, updatedUser);
        updatedUser;
      };
    };
  };

  public shared ({ caller }) func requestPlanPurchase(planId : PlanId, paymentApp : PaymentApp, utrNumber : UTRNumber) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request plan purchases");
    };
    switch (state.users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        // Verify plan exists
        switch (state.plans.get(planId)) {
          case (null) { Runtime.trap("Plan not found") };
          case (?_) {
            let paymentId = state.nextPaymentId;
            state.nextPaymentId += 1;

            let newSubmission : PaymentSubmission = {
              user = caller;
              planId;
              paymentApp;
              utrNumber;
              status = #pending;
              submittedAt = currentTime();
            };
            state.paymentSubmissions.add(paymentId, newSubmission);
          };
        };
      };
    };
  };

  public shared ({ caller }) func requestWithdrawal(amount : Nat, upiId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request withdrawals");
    };
    if (amount < 100) { Runtime.trap("Minimum withdrawal amount is 100") };
    switch (state.users.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) {
        // Update earnings before checking balance
        let updatedUser = updateUserEarnings(user);
        state.users.add(caller, updatedUser);

        if (updatedUser.walletBalance < amount) { Runtime.trap("Insufficient balance") };
        
        let withdrawalId = state.nextWithdrawalId;
        state.nextWithdrawalId += 1;

        let newRequest : WithdrawalRequest = {
          user = caller;
          amount;
          upiId;
          status = #pending;
          requestedAt = currentTime();
        };
        state.withdrawalRequests.add(withdrawalId, newRequest);
      };
    };
  };

  public shared ({ caller }) func requestDeposit(amount : Nat, utrNumber : UTRNumber) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request deposits");
    };
    let depositId = state.nextDepositId;
    state.nextDepositId += 1;

    let newRequest : DepositRequest = {
      user = caller;
      amount;
      utrNumber;
      status = #pending;
      submittedAt = currentTime();
    };
    state.depositRequests.add(depositId, newRequest);
  };
};
