import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../auth/data/auth_repository.dart';

class WatchProgress {
  const WatchProgress({
    required this.contentId,
    required this.position,
    required this.duration,
    required this.updatedAt,
  });

  final String contentId;
  final Duration position;
  final Duration duration;
  final DateTime updatedAt;

  double get fraction =>
      duration.inMilliseconds == 0 ? 0 : (position.inMilliseconds / duration.inMilliseconds).clamp(0, 1);

  /// The credits are rolling. Treat it as watched and drop it from the rail.
  bool get isFinished => fraction >= 0.95;

  /// Only worth resuming after the first 30 seconds.
  bool get isResumable => !isFinished && position >= const Duration(seconds: 30);

  Duration get remaining => duration - position;

  Map<String, dynamic> toMap() => {
    'contentId': contentId,
    'positionMs': position.inMilliseconds,
    'durationMs': duration.inMilliseconds,
    'updatedAt': FieldValue.serverTimestamp(),
  };

  factory WatchProgress.fromMap(Map<String, dynamic> map) => WatchProgress(
    contentId: map['contentId'] as String,
    position: Duration(milliseconds: map['positionMs'] as int? ?? 0),
    duration: Duration(milliseconds: map['durationMs'] as int? ?? 0),
    // Null for a moment on the writing device, until the server stamps it.
    updatedAt: (map['updatedAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
  );
}

abstract class ProgressRepository {
  Stream<List<WatchProgress>> watchRecent(String uid);
  Future<void> save(String uid, WatchProgress progress);
  Future<void> remove(String uid, String contentId);
}

/// Stored at `users/{uid}/progress/{contentId}`. Because it lives in the
/// cloud, pausing on a phone and opening the app on a TV resumes at the
/// same second.
class FirestoreProgressRepository implements ProgressRepository {
  FirestoreProgressRepository(this._db);

  final FirebaseFirestore _db;

  CollectionReference<Map<String, dynamic>> _col(String uid) => _db.collection('users').doc(uid).collection('progress');

  @override
  Stream<List<WatchProgress>> watchRecent(String uid) =>
      _col(uid)
          .orderBy('updatedAt', descending: true)
          .limit(20)
          .snapshots()
          .map((q) => q.docs.map((d) => WatchProgress.fromMap(d.data())).toList());

  @override
  Future<void> save(String uid, WatchProgress progress) => _col(uid).doc(progress.contentId).set(progress.toMap());

  @override
  Future<void> remove(String uid, String contentId) => _col(uid).doc(contentId).delete();
}

final progressRepositoryProvider = Provider<ProgressRepository>(
  (ref) => FirestoreProgressRepository(FirebaseFirestore.instance),
);

final recentProgressProvider = StreamProvider<List<WatchProgress>>((ref) {
  final user = ref.watch(currentUserProvider);
  if (user == null) return Stream.value(const []);
  return ref.watch(progressRepositoryProvider).watchRecent(user.uid);
});

final progressForProvider = Provider.family<WatchProgress?, String>(
  (ref, contentId) => ref.watch(recentProgressProvider).value?.where((p) => p.contentId == contentId).firstOrNull,
);
