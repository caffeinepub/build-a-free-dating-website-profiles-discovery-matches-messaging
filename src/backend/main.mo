import Map "mo:core/Map";
import Set "mo:core/Set";
import List "mo:core/List";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type MatchId = Nat;

  public type Gender = {
    #female;
    #male;
    #other : Text;
  };

  public type UserProfile = {
    displayName : Text;
    age : Nat;
    gender : Gender;
    interestedIn : Gender;
    location : Text;
    bio : Text;
    interests : [Text];
    photoUrls : [Text];
    createdAt : Time.Time;
    updatedAt : Time.Time;
    isActive : Bool;
    hasAgreedToTerms : Bool;
  };

  public type Profile = {
    principal : Principal;
    displayName : Text;
    age : Nat;
    gender : Gender;
    interestedIn : Gender;
    location : Text;
    bio : Text;
    interests : [Text];
    photoUrls : [Text];
    createdAt : Time.Time;
    updatedAt : Time.Time;
    isActive : Bool;
    unreadMessagesCount : Nat;
    lastMessagePreview : ?Text;
    timestamp : Time.Time;
  };

  public type Like = {
    from : Principal;
    to : Principal;
    timestamp : Time.Time;
  };

  public type Match = {
    id : MatchId;
    user1 : Principal;
    user2 : Principal;
    timestamp : Time.Time;
  };

  public type Message = {
    matchId : MatchId;
    sender : Principal;
    recipient : Principal;
    content : Text;
    timestamp : Time.Time;
  };

  public type Report = {
    reporter : Principal;
    reportedUser : Principal;
    reason : Text;
    note : Text;
    timestamp : Time.Time;
  };

  module Profile {
    public func compare(profile1 : Profile, profile2 : Profile) : Order.Order {
      Principal.compare(profile1.principal, profile2.principal);
    };

    public func compareByTimestamp(profile1 : Profile, profile2 : Profile) : Order.Order {
      Int.compare(profile1.timestamp, profile2.timestamp);
    };
  };

  let profiles = Map.empty<Principal, UserProfile>();
  let likes = Map.empty<Principal, Set.Set<Principal>>();
  let passes = Map.empty<Principal, Set.Set<Principal>>();
  let matches = Map.empty<Principal, Set.Set<Principal>>();
  let blockList = Map.empty<Principal, Set.Set<Principal>>();
  let reports = List.empty<Report>();
  let conversations = Map.empty<MatchId, List.List<Message>>();
  let unreadCounts = Map.empty<Principal, Map.Map<Principal, Nat>>();
  var nextMatchId = 1;

  // Required frontend functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };

    // Users can view their own profile or profiles of non-blocked users
    if (caller == user) {
      return profiles.get(user);
    };

    // Check if caller has blocked this user or vice versa
    let callerBlocks = switch (blockList.get(caller)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };

    let userBlocks = switch (blockList.get(user)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };

    if (callerBlocks.contains(user) or userBlocks.contains(caller)) {
      return null;
    };

    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    if (profile.age < 18) {
      Runtime.trap("Users must be 18 or older");
    };

    if (not profile.hasAgreedToTerms) {
      Runtime.trap("Users must agree to the terms to use this service");
    };

    // Check if profile exists to preserve creation timestamp
    let createdAt = switch (profiles.get(caller)) {
      case (?existingProfile) { existingProfile.createdAt };
      case (null) { Time.now() };
    };

    let updatedProfile : UserProfile = {
      displayName = profile.displayName;
      age = profile.age;
      gender = profile.gender;
      interestedIn = profile.interestedIn;
      location = profile.location;
      bio = profile.bio;
      interests = profile.interests;
      photoUrls = profile.photoUrls;
      createdAt = createdAt;
      updatedAt = Time.now();
      isActive = profile.isActive;
      hasAgreedToTerms = profile.hasAgreedToTerms;
    };

    profiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func updateProfile(displayName : Text, age : Nat, gender : Gender, interestedIn : Gender, location : Text, bio : Text, interests : [Text], photoUrls : [Text], confirmTerms : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only registered users can create a profile");
    };

    if (age < 18) {
      Runtime.trap("Users must be 18 or older");
    };

    if (not confirmTerms) {
      Runtime.trap("Users must agree to the terms to use this service");
    };

    let createdAt = switch (profiles.get(caller)) {
      case (?existingProfile) { existingProfile.createdAt };
      case (null) { Time.now() };
    };

    let profile : UserProfile = {
      displayName;
      age;
      gender;
      interestedIn;
      location;
      bio;
      interests;
      photoUrls;
      createdAt;
      updatedAt = Time.now();
      isActive = true;
      hasAgreedToTerms = confirmTerms;
    };

    profiles.add(caller, profile);
  };

  public query ({ caller }) func getRecommendedProfiles(ageMin : ?Nat, ageMax : ?Nat, genderFilter : ?Gender, interestedInFilter : ?Gender, interestTags : ?[Text]) : async [Profile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Must be registered to use this feature");
    };

    let callerProfile = switch (profiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Caller must have a profile to view recommendations") };
    };

    let userBlocks = switch (blockList.get(caller)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };

    let callerPasses = switch (passes.get(caller)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };

    let recommended = profiles.entries()
      .filter(func((p, profile)) : Bool {
        // Exclude self
        if (p == caller) { return false };

        // Exclude blocked users (both ways)
        if (userBlocks.contains(p)) { return false };
        let blockedByOther = switch (blockList.get(p)) {
          case (?set) { set.contains(caller) };
          case (null) { false };
        };
        if (blockedByOther) { return false };

        // Exclude inactive profiles
        if (not profile.isActive) { return false };

        // Exclude passed profiles
        if (callerPasses.contains(p)) { return false };

        // Apply age filter
        switch (ageMin) {
          case (?min) { if (profile.age < min) { return false } };
          case (null) {};
        };
        switch (ageMax) {
          case (?max) { if (profile.age > max) { return false } };
          case (null) {};
        };

        // Apply gender filter
        switch (genderFilter) {
          case (?gender) {
            switch (profile.gender, gender) {
              case (#female, #female) {};
              case (#male, #male) {};
              case (#other(a), #other(b)) { if (a != b) { return false } };
              case _ { return false };
            };
          };
          case (null) {};
        };

        // Apply interested-in filter
        switch (interestedInFilter) {
          case (?interested) {
            switch (profile.interestedIn, interested) {
              case (#female, #female) {};
              case (#male, #male) {};
              case (#other(a), #other(b)) { if (a != b) { return false } };
              case _ { return false };
            };
          };
          case (null) {};
        };

        // Apply interest tags filter
        switch (interestTags) {
          case (?tags) {
            if (tags.size() > 0) {
              let hasMatch = tags.any(func(tag : Text) : Bool {
                profile.interests.any(func(interest : Text) : Bool {
                  interest.toLower() == tag.toLower();
                });
              });
              if (not hasMatch) { return false };
            };
          };
          case (null) {};
        };

        true;
      })
      .map(func((p, profile) : (Principal, UserProfile)) : Profile {
        let unreadMap = switch (unreadCounts.get(caller)) {
          case (?map) { map };
          case (null) { Map.empty<Principal, Nat>() };
        };
        let unreadCount = switch (unreadMap.get(p)) {
          case (?count) { count };
          case (null) { 0 };
        };

        let lastMessage = getLastMessageBetween(caller, p);

        {
          principal = p;
          displayName = profile.displayName;
          age = profile.age;
          gender = profile.gender;
          interestedIn = profile.interestedIn;
          location = profile.location;
          bio = profile.bio;
          interests = profile.interests;
          photoUrls = profile.photoUrls;
          createdAt = profile.createdAt;
          updatedAt = profile.updatedAt;
          isActive = profile.isActive;
          unreadMessagesCount = unreadCount;
          lastMessagePreview = lastMessage;
          timestamp = profile.updatedAt;
        };
      });
    recommended.toArray();
  };

  func getLastMessageBetween(user1 : Principal, user2 : Principal) : ?Text {
    let matchId = findMatchId(user1, user2);
    switch (conversations.get(matchId)) {
      case (?conv) {
        let messages = conv.toArray();
        if (messages.size() > 0) {
          ?messages[messages.size() - 1].content;
        } else {
          null;
        };
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func likeProfile(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Users must be signed in and have a completed profile to use this feature");
    };

    let callerProfile = switch (profiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Caller must have a profile to like others") };
    };

    let targetProfile = switch (profiles.get(target)) {
      case (null) { Runtime.trap("No profile found for target user") };
      case (?profile) { profile };
    };

    if (caller == target) {
      Runtime.trap("Self-matching is not allowed");
    };

    // Check if blocked
    let callerBlocks = switch (blockList.get(caller)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };
    let targetBlocks = switch (blockList.get(target)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };

    if (callerBlocks.contains(target) or targetBlocks.contains(caller)) {
      Runtime.trap("Cannot like blocked users");
    };

    let likeSet = switch (likes.get(caller)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };

    if (likeSet.contains(target)) { return };

    likeSet.add(target);
    likes.add(caller, likeSet);

    // Check for mutual like (match)
    switch (likes.get(target)) {
      case (?targetLikes) {
        if (targetLikes.contains(caller)) {
          addMatch(caller, target);
        };
      };
      case (null) {};
    };
  };

  public shared ({ caller }) func passProfile(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Users must be signed in to use this feature");
    };

    let callerProfile = switch (profiles.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("Caller must have a profile") };
    };

    let targetProfile = switch (profiles.get(target)) {
      case (null) { Runtime.trap("No profile found for target user") };
      case (?profile) { profile };
    };

    if (caller == target) {
      Runtime.trap("Cannot pass on yourself");
    };

    let passSet = switch (passes.get(caller)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };

    if (passSet.contains(target)) { return };

    passSet.add(target);
    passes.add(caller, passSet);
  };

  func addMatch(user1 : Principal, user2 : Principal) {
    let user1Matches = switch (matches.get(user1)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };
    let user2Matches = switch (matches.get(user2)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };

    user1Matches.add(user2);
    user2Matches.add(user1);

    matches.add(user1, user1Matches);
    matches.add(user2, user2Matches);
  };

  public query ({ caller }) func getMatches() : async { sent : [Profile]; received : [Profile]; matches : [Profile] } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view matches");
    };

    let likeSet = switch (likes.get(caller)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };

    let sent = likeSet.toArray()
      .map(func(p : Principal) : ?Profile {
        switch (profiles.get(p)) {
          case (?profile) {
            ?{
              principal = p;
              displayName = profile.displayName;
              age = profile.age;
              gender = profile.gender;
              interestedIn = profile.interestedIn;
              location = profile.location;
              bio = profile.bio;
              interests = profile.interests;
              photoUrls = profile.photoUrls;
              createdAt = profile.createdAt;
              updatedAt = profile.updatedAt;
              isActive = profile.isActive;
              unreadMessagesCount = 0;
              lastMessagePreview = null;
              timestamp = profile.updatedAt;
            };
          };
          case (null) { null };
        };
      })
      .filter(func(opt : ?Profile) : Bool { opt != null })
      .map(func(opt : ?Profile) : Profile {
        switch (opt) {
          case (?profile) { profile };
          case (null) { Runtime.unreachable() };
        };
      });

    let receivedSet = Set.empty<Principal>();
    for ((from, likeSet) in likes.entries()) {
      if (likeSet.contains(caller)) {
        receivedSet.add(from);
      };
    };

    let received = receivedSet.toArray()
      .map(func(p : Principal) : ?Profile {
        switch (profiles.get(p)) {
          case (?profile) {
            ?{
              principal = p;
              displayName = profile.displayName;
              age = profile.age;
              gender = profile.gender;
              interestedIn = profile.interestedIn;
              location = profile.location;
              bio = profile.bio;
              interests = profile.interests;
              photoUrls = profile.photoUrls;
              createdAt = profile.createdAt;
              updatedAt = profile.updatedAt;
              isActive = profile.isActive;
              unreadMessagesCount = 0;
              lastMessagePreview = null;
              timestamp = profile.updatedAt;
            };
          };
          case (null) { null };
        };
      })
      .filter(func(opt : ?Profile) : Bool { opt != null })
      .map(func(opt : ?Profile) : Profile {
        switch (opt) {
          case (?profile) { profile };
          case (null) { Runtime.unreachable() };
        };
      });

    let matchSet = switch (matches.get(caller)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };

    let unreadMap = switch (unreadCounts.get(caller)) {
      case (?map) { map };
      case (null) { Map.empty<Principal, Nat>() };
    };

    let matchProfiles = matchSet.toArray()
      .map(func(p : Principal) : ?Profile {
        switch (profiles.get(p)) {
          case (?profile) {
            let unreadCount = switch (unreadMap.get(p)) {
              case (?count) { count };
              case (null) { 0 };
            };
            let lastMessage = getLastMessageBetween(caller, p);
            ?{
              principal = p;
              displayName = profile.displayName;
              age = profile.age;
              gender = profile.gender;
              interestedIn = profile.interestedIn;
              location = profile.location;
              bio = profile.bio;
              interests = profile.interests;
              photoUrls = profile.photoUrls;
              createdAt = profile.createdAt;
              updatedAt = profile.updatedAt;
              isActive = profile.isActive;
              unreadMessagesCount = unreadCount;
              lastMessagePreview = lastMessage;
              timestamp = profile.updatedAt;
            };
          };
          case (null) { null };
        };
      })
      .filter(func(opt : ?Profile) : Bool { opt != null })
      .map(func(opt : ?Profile) : Profile {
        switch (opt) {
          case (?profile) { profile };
          case (null) { Runtime.unreachable() };
        };
      });

    { sent; received; matches = matchProfiles };
  };

  public shared ({ caller }) func sendMessage(recipient : Principal, content : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be signed in to do this");
    };

    let senderMatches = switch (matches.get(caller)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };

    if (not senderMatches.contains(recipient)) {
      Runtime.trap("A match is needed before you can send messages to another user");
    };

    let matchId = findMatchId(caller, recipient);

    let newMessage : Message = {
      matchId;
      sender = caller;
      recipient;
      content;
      timestamp = Time.now();
    };

    let updatedConversation = switch (conversations.get(matchId)) {
      case (?existingConversation) {
        let newConversation = existingConversation.clone();
        newConversation.add(newMessage);
        newConversation;
      };
      case (null) { List.singleton<Message>(newMessage) };
    };

    conversations.add(matchId, updatedConversation);

    // Update unread count for recipient
    let recipientUnreadMap = switch (unreadCounts.get(recipient)) {
      case (?map) { map };
      case (null) { Map.empty<Principal, Nat>() };
    };

    let currentUnread = switch (recipientUnreadMap.get(caller)) {
      case (?count) { count };
      case (null) { 0 };
    };

    recipientUnreadMap.add(caller, currentUnread + 1);
    unreadCounts.add(recipient, recipientUnreadMap);
  };

  public query ({ caller }) func getConversation(otherUser : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be signed in to view conversations");
    };

    let callerMatches = switch (matches.get(caller)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };

    if (not callerMatches.contains(otherUser)) {
      Runtime.trap("Can only view conversations with matched users");
    };

    let matchId = findMatchId(caller, otherUser);

    switch (conversations.get(matchId)) {
      case (?conv) { conv.toArray() };
      case (null) { [] };
    };
  };

  public shared ({ caller }) func markConversationAsRead(otherUser : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be signed in");
    };

    let callerMatches = switch (matches.get(caller)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };

    if (not callerMatches.contains(otherUser)) {
      Runtime.trap("Can only mark conversations with matched users as read");
    };

    let callerUnreadMap = switch (unreadCounts.get(caller)) {
      case (?map) { map };
      case (null) { Map.empty<Principal, Nat>() };
    };

    callerUnreadMap.add(otherUser, 0);
    unreadCounts.add(caller, callerUnreadMap);
  };

  func findMatchId(user1 : Principal, user2 : Principal) : MatchId {
    let hash1 = user1.hash().toNat();
    let hash2 = user2.hash().toNat();
    if (hash1 < hash2) {
      hash1 + hash2 * 1000000;
    } else {
      hash2 + hash1 * 1000000;
    };
  };

  public shared ({ caller }) func blockUser(blocked : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be signed in to do this");
    };

    if (caller == blocked) {
      Runtime.trap("Cannot block yourself");
    };

    let existingBlocks = switch (blockList.get(caller)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };

    if (existingBlocks.contains(blocked)) { return };

    existingBlocks.add(blocked);
    blockList.add(caller, existingBlocks);

    // Remove from matches if exists
    let callerMatches = switch (matches.get(caller)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };
    callerMatches.remove(blocked);
    matches.add(caller, callerMatches);

    let blockedMatches = switch (matches.get(blocked)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };
    blockedMatches.remove(caller);
    matches.add(blocked, blockedMatches);
  };

  public shared ({ caller }) func reportUser(reportedUser : Principal, reason : Text, note : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be signed in to do this");
    };

    if (caller == reportedUser) {
      Runtime.trap("Cannot report yourself");
    };

    let newReport : Report = {
      reporter = caller;
      reportedUser;
      reason;
      note;
      timestamp = Time.now();
    };

    reports.add(newReport);
  };

  public query ({ caller }) func getReports() : async [Report] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view reports");
    };

    reports.toArray();
  };

  public query ({ caller }) func getBlockedUsers() : async [Principal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: You must be signed in to view blocked users");
    };

    let blockedSet = switch (blockList.get(caller)) {
      case (?set) { set };
      case (null) { Set.empty<Principal>() };
    };

    blockedSet.toArray();
  };
};
