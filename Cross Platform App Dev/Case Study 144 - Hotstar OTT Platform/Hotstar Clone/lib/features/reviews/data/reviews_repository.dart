import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class Review {
  const Review({
    required this.uid,
    required this.author,
    required this.stars,
    required this.text,
    required this.spoiler,
    required this.createdAt,
  });

  final String uid;
  final String author;
  final int stars;
  final String text;
  final bool spoiler;
  final DateTime createdAt;

  static const minLength = 10;
  static const maxLength = 500;

  Map<String, dynamic> toMap() => {
    'uid': uid,
    'author': author,
    'stars': stars,
    'text': text,
    'spoiler': spoiler,
    'createdAt': FieldValue.serverTimestamp(),
  };

  factory Review.fromMap(Map<String, dynamic> map) => Review(
    uid: map['uid'] as String,
    author: map['author'] as String? ?? 'Viewer',
    stars: map['stars'] as int? ?? 0,
    text: map['text'] as String? ?? '',
    spoiler: map['spoiler'] as bool? ?? false,
    createdAt: (map['createdAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
  );
}

abstract class ReviewsRepository {
  Stream<List<Review>> watch(String contentId);
  Future<void> upsert(String contentId, Review review);
  Future<void> delete(String contentId, String uid);
}

/// Stored at `titles/{contentId}/reviews/{uid}`. Using the uid as the
/// document id means one review per person per title; editing overwrites it.
class FirestoreReviewsRepository implements ReviewsRepository {
  FirestoreReviewsRepository(this._db);

  final FirebaseFirestore _db;

  CollectionReference<Map<String, dynamic>> _col(String contentId) =>
      _db.collection('titles').doc(contentId).collection('reviews');

  @override
  Stream<List<Review>> watch(String contentId) =>
      _col(contentId)
          .orderBy('createdAt', descending: true)
          .limit(50)
          .snapshots()
          .map((q) => q.docs.map((d) => Review.fromMap(d.data())).toList());

  @override
  Future<void> upsert(String contentId, Review review) => _col(contentId).doc(review.uid).set(review.toMap());

  @override
  Future<void> delete(String contentId, String uid) => _col(contentId).doc(uid).delete();
}

final reviewsRepositoryProvider = Provider<ReviewsRepository>(
  (ref) => FirestoreReviewsRepository(FirebaseFirestore.instance),
);

final reviewsProvider = StreamProvider.family<List<Review>, String>(
  (ref, contentId) => ref.watch(reviewsRepositoryProvider).watch(contentId),
);
