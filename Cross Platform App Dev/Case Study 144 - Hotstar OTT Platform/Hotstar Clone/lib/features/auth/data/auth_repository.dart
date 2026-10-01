import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AppUser {
  const AppUser({required this.uid, required this.email, required this.displayName});

  final String uid;
  final String email;
  final String displayName;
}

class AuthFailure implements Exception {
  const AuthFailure(this.message);
  final String message;

  @override
  String toString() => message;
}

abstract class AuthRepository {
  Stream<AppUser?> authStateChanges();
  AppUser? get currentUser;
  Future<AppUser> signIn({required String email, required String password});
  Future<AppUser> signUp({required String name, required String email, required String password});
  Future<void> sendPasswordReset(String email);
  Future<void> signOut();
}

class FirebaseAuthRepository implements AuthRepository {
  FirebaseAuthRepository(this._auth);

  final FirebaseAuth _auth;

  AppUser? _map(User? u) => u == null
      ? null
      : AppUser(
          uid: u.uid,
          email: (u.email ?? '').toLowerCase(),
          displayName: u.displayName?.trim().isNotEmpty == true
              ? u.displayName!.trim()
              : (u.email ?? 'Viewer').split('@').first,
        );

  // userChanges() also fires when the display name changes after sign-up.
  @override
  Stream<AppUser?> authStateChanges() => _auth.userChanges().map(_map);

  @override
  AppUser? get currentUser => _map(_auth.currentUser);

  @override
  Future<AppUser> signIn({required String email, required String password}) => _guard(() async {
    final cred = await _auth.signInWithEmailAndPassword(email: email.trim(), password: password);
    return _map(cred.user)!;
  });

  @override
  Future<AppUser> signUp({required String name, required String email, required String password}) => _guard(() async {
    final cred = await _auth.createUserWithEmailAndPassword(email: email.trim(), password: password);
    await cred.user!.updateDisplayName(name.trim());
    await cred.user!.reload();
    return _map(_auth.currentUser)!;
  });

  @override
  Future<void> sendPasswordReset(String email) => _guard(() => _auth.sendPasswordResetEmail(email: email.trim()));

  @override
  Future<void> signOut() => _auth.signOut();

  Future<T> _guard<T>(Future<T> Function() run) async {
    try {
      return await run();
    } on FirebaseAuthException catch (e) {
      throw AuthFailure(switch (e.code) {
        'invalid-email' => 'That email address looks invalid.',
        'user-disabled' => 'This account has been disabled.',
        'user-not-found' || 'wrong-password' || 'invalid-credential' => 'Email or password is incorrect.',
        'email-already-in-use' => 'An account with this email already exists. Try signing in.',
        'weak-password' => 'Choose a stronger password (at least 8 characters).',
        'too-many-requests' => 'Too many attempts. Wait a minute and try again.',
        'network-request-failed' => "Can't reach the server. Check your connection.",
        _ => e.message ?? 'Something went wrong (${e.code}).',
      });
    }
  }
}

final authRepositoryProvider = Provider<AuthRepository>((ref) => FirebaseAuthRepository(FirebaseAuth.instance));

final authStateProvider = StreamProvider<AppUser?>((ref) => ref.watch(authRepositoryProvider).authStateChanges());

/// The signed-in user. Every screen behind the auth redirect can rely on it.
final currentUserProvider = Provider<AppUser?>((ref) => ref.watch(authStateProvider).value);
