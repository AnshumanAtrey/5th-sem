import 'dart:async';

import 'package:hotstar_clone/features/account/data/account_repository.dart';
import 'package:hotstar_clone/features/account/domain/user_profile.dart';
import 'package:hotstar_clone/features/auth/data/auth_repository.dart';
import 'package:hotstar_clone/features/live/data/live_repository.dart';
import 'package:hotstar_clone/features/parental/domain/parental_settings.dart';
import 'package:hotstar_clone/features/progress/data/progress_repository.dart';
import 'package:hotstar_clone/features/reviews/data/reviews_repository.dart';
import 'package:hotstar_clone/features/subscription/domain/plan.dart';

/// In-memory stand-ins for the Firebase repositories, so screens can be
/// rendered and tested without a network or emulator.
const testUser = AppUser(uid: 'u1', email: 'anshuman@atrey.dev', displayName: 'Anshuman');

class FakeAuthRepository implements AuthRepository {
  FakeAuthRepository({this.user = testUser});
  final AppUser? user;

  @override
  Stream<AppUser?> authStateChanges() => Stream.value(user);
  @override
  AppUser? get currentUser => user;
  @override
  Future<AppUser> signIn({required String email, required String password}) async => user!;
  @override
  Future<AppUser> signUp({required String name, required String email, required String password}) async => user!;
  @override
  Future<void> sendPasswordReset(String email) async {}
  @override
  Future<void> signOut() async {}
}

class FakeAccountRepository implements AccountRepository {
  FakeAccountRepository({Plan plan = Plan.free, ParentalSettings parental = const ParentalSettings()})
    : _profile = UserProfile(
        uid: testUser.uid,
        displayName: testUser.displayName,
        email: testUser.email,
        plan: plan,
        parental: parental,
      );

  UserProfile _profile;
  final _changes = StreamController<UserProfile?>.broadcast();

  @override
  Stream<UserProfile?> watchProfile(String uid) async* {
    yield _profile;
    yield* _changes.stream;
  }

  void _emit(UserProfile p) {
    _profile = p;
    _changes.add(p);
  }

  @override
  Future<void> ensureProfile(AppUser user) async {}
  @override
  Future<void> setPlan(String uid, Plan plan) async => _emit(
    UserProfile(
      uid: uid,
      displayName: _profile.displayName,
      email: _profile.email,
      plan: plan,
      parental: _profile.parental,
    ),
  );
  @override
  Future<void> setFamily(String uid, List<String> emails) async {}
  @override
  Future<void> setParental(String uid, ParentalSettings settings) async => _emit(
    UserProfile(
      uid: uid,
      displayName: _profile.displayName,
      email: _profile.email,
      plan: _profile.plan,
      parental: settings,
    ),
  );
  @override
  Stream<bool> watchFamilyPremium(String email) => Stream.value(false);
}

class FakeProgressRepository implements ProgressRepository {
  FakeProgressRepository([this.items = const []]);
  final List<WatchProgress> items;

  @override
  Stream<List<WatchProgress>> watchRecent(String uid) => Stream.value(items);
  @override
  Future<void> save(String uid, WatchProgress progress) async {}
  @override
  Future<void> remove(String uid, String contentId) async {}
}

class FakeReviewsRepository implements ReviewsRepository {
  FakeReviewsRepository([this.items = const []]);
  final List<Review> items;

  @override
  Stream<List<Review>> watch(String contentId) => Stream.value(items);
  @override
  Future<void> upsert(String contentId, Review review) async {}
  @override
  Future<void> delete(String contentId, String uid) async {}
}

class FakeLiveRepository implements LiveRepository {
  FakeLiveRepository([this.messages = const []]);
  final List<ChatMessage> messages;

  @override
  Stream<List<ChatMessage>> watchChat(String channelId) => Stream.value(messages);
  @override
  Future<void> sendChat(String channelId, {required String uid, required String author, required String text}) async {}
  @override
  Stream<List<Reaction>> watchReactions(String channelId, DateTime since) => const Stream.empty();
  @override
  Future<void> react(String channelId, {required String uid, required String emoji}) async {}
}
