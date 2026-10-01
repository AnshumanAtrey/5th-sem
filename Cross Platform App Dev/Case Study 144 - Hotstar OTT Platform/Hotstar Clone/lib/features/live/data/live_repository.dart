import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.uid,
    required this.author,
    required this.text,
    required this.sentAt,
  });

  final String id;
  final String uid;
  final String author;
  final String text;
  final DateTime sentAt;

  static const maxLength = 200;

  factory ChatMessage.fromDoc(String id, Map<String, dynamic> map) => ChatMessage(
    id: id,
    uid: map['uid'] as String,
    author: map['author'] as String? ?? 'Viewer',
    text: map['text'] as String? ?? '',
    sentAt: (map['sentAt'] as Timestamp?)?.toDate() ?? DateTime.now(),
  );
}

class Reaction {
  const Reaction({required this.id, required this.uid, required this.emoji});

  final String id;
  final String uid;
  final String emoji;

  /// Reactions are limited to this list, and the Firestore rules check it too.
  static const allowed = ['🔥', '👏', '😂', '😮', '❤️', '🏏'];
}

abstract class LiveRepository {
  Stream<List<ChatMessage>> watchChat(String channelId);
  Future<void> sendChat(String channelId, {required String uid, required String author, required String text});

  /// Only reactions sent after [since]. A viewer who joins late doesn't
  /// replay the whole history of emojis.
  Stream<List<Reaction>> watchReactions(String channelId, DateTime since);
  Future<void> react(String channelId, {required String uid, required String emoji});
}

/// Stored at `live/{channelId}/messages` and `live/{channelId}/reactions`.
/// Firestore real-time listeners push each write to every open device.
class FirestoreLiveRepository implements LiveRepository {
  FirestoreLiveRepository(this._db);

  final FirebaseFirestore _db;

  CollectionReference<Map<String, dynamic>> _col(String channelId, String name) =>
      _db.collection('live').doc(channelId).collection(name);

  @override
  Stream<List<ChatMessage>> watchChat(String channelId) => _col(channelId, 'messages')
      .orderBy('sentAt', descending: true)
      .limit(60)
      .snapshots()
      .map((q) => q.docs.map((d) => ChatMessage.fromDoc(d.id, d.data())).toList());

  @override
  Future<void> sendChat(String channelId, {required String uid, required String author, required String text}) => _col(
    channelId,
    'messages',
  ).add({'uid': uid, 'author': author, 'text': text, 'sentAt': FieldValue.serverTimestamp()});

  @override
  Stream<List<Reaction>> watchReactions(String channelId, DateTime since) => _col(channelId, 'reactions')
      .where('sentAt', isGreaterThan: Timestamp.fromDate(since))
      .orderBy('sentAt')
      .snapshots()
      .map(
        (q) => [
          for (final change in q.docChanges)
            if (change.type == DocumentChangeType.added)
              Reaction(
                id: change.doc.id,
                uid: change.doc.data()!['uid'] as String,
                emoji: change.doc.data()!['emoji'] as String,
              ),
        ],
      );

  @override
  Future<void> react(String channelId, {required String uid, required String emoji}) =>
      _col(channelId, 'reactions').add({'uid': uid, 'emoji': emoji, 'sentAt': FieldValue.serverTimestamp()});
}

final liveRepositoryProvider = Provider<LiveRepository>((ref) => FirestoreLiveRepository(FirebaseFirestore.instance));

final chatProvider = StreamProvider.family<List<ChatMessage>, String>(
  (ref, channelId) => ref.watch(liveRepositoryProvider).watchChat(channelId),
);
