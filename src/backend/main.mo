import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import CoreTime "mo:core/Time";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  var nextPostId = 1;
  let posts = Map.empty<Nat, Post>();

  type timestamp = Int;

  type Post = {
    title : Text;
    body : Text;
    tags : List.List<Text>;
    createdAt : timestamp;
    updatedAt : timestamp;
    published : Bool;
  };

  module Post {
    public func compareByCreatedAt(post1 : (Nat, Post), post2 : (Nat, Post)) : Order.Order {
      Int.compare(post2.1.createdAt, post1.1.createdAt);
    };

    public func toNonActor(post : Post) : PostNonActor {
      {
        post with
        tags = post.tags.toArray();
      };
    };
  };

  type PostNonActor = {
    title : Text;
    body : Text;
    tags : [Text];
    createdAt : timestamp;
    updatedAt : timestamp;
    published : Bool;
  };

  type PostPayload = {
    title : Text;
    body : Text;
    tags : [Text];
    published : Bool;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  private func getPostInternal(id : Nat) : Post {
    switch (posts.get(id)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) { post };
    };
  };

  public shared ({ caller }) func initializeSamplePosts() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can initialize sample posts");
    };

    if (not posts.isEmpty()) { return };

    let now = CoreTime.now();
    let samplePosts = [
      {
        title = "Welcome Post";
        body = "This is the first post on the blog!";
        tags = List.fromArray(["welcome", "blog"]);
        createdAt = now;
        updatedAt = now;
        published = true;
      },
      {
        title = "Draft Post";
        body = "This is a draft post, not yet published.";
        tags = List.fromArray(["draft"]);
        createdAt = now;
        updatedAt = now;
        published = false;
      },
    ];

    var id = nextPostId;
    for (post in samplePosts.values()) {
      posts.add(id, post);
      id += 1;
    };
    nextPostId += samplePosts.size();
  };

  public shared ({ caller }) func createPost(payload : PostPayload) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can create posts");
    };

    let now = CoreTime.now();
    let post : Post = {
      payload with
      tags = List.fromArray(payload.tags);
      createdAt = now;
      updatedAt = now;
    };

    let postId = nextPostId;
    posts.add(postId, post);
    nextPostId += 1;
    postId;
  };

  public shared ({ caller }) func updatePost(id : Nat, payload : PostPayload) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can update posts");
    };

    let post = getPostInternal(id);
    let updatedPost : Post = {
      payload with
      tags = List.fromArray(payload.tags);
      createdAt = post.createdAt;
      updatedAt = CoreTime.now();
    };

    posts.add(id, updatedPost);
  };

  public shared ({ caller }) func deletePost(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can delete posts");
    };

    if (not posts.containsKey(id)) {
      Runtime.trap("Post not found");
    };

    posts.remove(id);
  };

  public query ({ caller }) func getPost(id : Nat) : async PostNonActor {
    let post = switch (posts.get(id)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) { post };
    };

    if (not post.published and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view draft posts");
    };

    Post.toNonActor(post);
  };

  public query ({ caller }) func getPublishedPosts() : async [(Nat, PostNonActor)] {
    let filtered = posts.toArray().filter(func((_, post)) { post.published });
    let sorted = filtered.sort(Post.compareByCreatedAt);

    sorted.map(
      func((id, post)) {
        (id, Post.toNonActor(post));
      }
    );
  };

  public query ({ caller }) func getAllPosts() : async [(Nat, PostNonActor)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can view all posts");
    };

    let sorted = posts.toArray().sort(Post.compareByCreatedAt);

    sorted.map(
      func((id, post)) {
        (id, Post.toNonActor(post));
      }
    );
  };

  public query ({ caller }) func getDraftPosts() : async [(Nat, PostNonActor)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can view draft posts");
    };

    let filtered = posts.toArray().filter(func((_, post)) { not post.published });
    let sorted = filtered.sort(Post.compareByCreatedAt);

    sorted.map(
      func((id, post)) {
        (id, Post.toNonActor(post));
      }
    );
  };
};
