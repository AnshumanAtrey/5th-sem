import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/data/auth_repository.dart';
import '../../parental/domain/parental_settings.dart';
import '../../subscription/domain/plan.dart';
import '../domain/user_profile.dart';

abstract class AccountRepository {
  Stream<UserProfile?> watchProfile(String uid);
  Future<void> ensureProfile(AppUser user);
  Future<void> setPlan(String uid, Plan plan);
  Future<void> setFamily(String uid, List<String> emails);
  Future<void> setParental(String uid, ParentalSettings settings);

  /// True while some Premium account lists [email] in its family.
  Stream<bool> watchFamilyPremium(String email);
}

/// Stored at `users/{uid}`.
class FirestoreAccountRepository implements AccountRepository {
  FirestoreAccountRepository(this._db);

  final FirebaseFirestore _db;

  DocumentReference<Map<String, dynamic>> _doc(String uid) => _db.collection('users').doc(uid);

  @override
  Stream<UserProfile?> watchProfile(String uid) =>
      _doc(uid).snapshots().map((s) => s.exists ? UserProfile.fromMap(uid, s.data()!) : null);

  @override
  Future<void> ensureProfile(AppUser user) => _db.runTransaction((tx) async {
    final snap = await tx.get(_doc(user.uid));
    if (snap.exists) {
      tx.update(_doc(user.uid), {'displayName': user.displayName, 'email': user.email});
    } else {
      tx.set(_doc(user.uid), {
        'displayName': user.displayName,
        'email': user.email,
        'plan': Plan.free.id,
        'familyEmails': <String>[],
        'createdAt': FieldValue.serverTimestamp(),
      });
    }
  });

  // Demo checkout: the client writes its own plan. In production a payment
  // webhook (a Cloud Function) would set it, and the rules would forbid
  // clients from writing `plan`. See firestore.rules.
  @override
  Future<void> setPlan(String uid, Plan plan) => _doc(uid).update({
    'plan': plan.id,
    'planChangedAt': FieldValue.serverTimestamp(),
    if (!plan.familySharing) 'familyEmails': <String>[],
  });

  @override
  Future<void> setFamily(String uid, List<String> emails) =>
      _doc(uid).update({'familyEmails': emails.map((e) => e.trim().toLowerCase()).toList()});

  @override
  Future<void> setParental(String uid, ParentalSettings settings) => _doc(uid).update({'parental': settings.toMap()});

  @override
  Stream<bool> watchFamilyPremium(String email) => _db
      .collection('users')
      .where('familyEmails', arrayContains: email.toLowerCase())
      .snapshots()
      .map((q) => q.docs.any((d) => d.data()['plan'] == Plan.premium.id));
}

final accountRepositoryProvider = Provider<AccountRepository>(
  (ref) => FirestoreAccountRepository(FirebaseFirestore.instance),
);

final profileProvider = StreamProvider<UserProfile?>((ref) {
  final user = ref.watch(currentUserProvider);
  if (user == null) return Stream.value(null);
  return ref.watch(accountRepositoryProvider).watchProfile(user.uid);
});

final _familyPremiumProvider = StreamProvider<bool>((ref) {
  final user = ref.watch(currentUserProvider);
  if (user == null || user.email.isEmpty) return Stream.value(false);
  return ref.watch(accountRepositoryProvider).watchFamilyPremium(user.email);
});

/// The plan that actually applies: your own, upgraded to Premium when
/// someone's Premium family includes you.
final effectivePlanProvider = Provider<Plan>((ref) {
  final own = ref.watch(profileProvider).value?.plan ?? Plan.free;
  final viaFamily = ref.watch(_familyPremiumProvider).value ?? false;
  return viaFamily && !own.includes(Plan.premium) ? Plan.premium : own;
});

/// True when the Premium comes from someone else's family, not your own plan.
final isFamilyMemberProvider = Provider<bool>((ref) {
  final own = ref.watch(profileProvider).value?.plan ?? Plan.free;
  return ref.watch(_familyPremiumProvider).value == true && own != Plan.premium;
});

final parentalSettingsProvider = Provider<ParentalSettings>(
  (ref) => ref.watch(profileProvider).value?.parental ?? const ParentalSettings(),
);
