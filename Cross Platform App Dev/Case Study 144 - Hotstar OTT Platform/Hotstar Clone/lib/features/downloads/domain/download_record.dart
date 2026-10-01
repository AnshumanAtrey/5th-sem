enum DownloadStatus { downloading, paused, completed, failed, expired }

class DownloadRecord {
  const DownloadRecord({
    required this.contentId,
    required this.title,
    required this.quality,
    required this.filePath,
    required this.status,
    required this.receivedBytes,
    required this.totalBytes,
    required this.startedAt,
    this.completedAt,
    this.firstPlayedAt,
    this.error,
  });

  final String contentId;
  final String title;
  final String quality;
  final String filePath;
  final DownloadStatus status;
  final int receivedBytes;

  /// 0 until the server reports a Content-Length.
  final int totalBytes;
  final DateTime startedAt;
  final DateTime? completedAt;
  final DateTime? firstPlayedAt;
  final String? error;

  double get fraction => totalBytes <= 0 ? 0 : (receivedBytes / totalBytes).clamp(0, 1);

  bool get isCompleted => status == DownloadStatus.completed;

  DownloadRecord copyWith({
    DownloadStatus? status,
    int? receivedBytes,
    int? totalBytes,
    DateTime? completedAt,
    DateTime? firstPlayedAt,
    String? error,
  }) => DownloadRecord(
    contentId: contentId,
    title: title,
    quality: quality,
    filePath: filePath,
    status: status ?? this.status,
    receivedBytes: receivedBytes ?? this.receivedBytes,
    totalBytes: totalBytes ?? this.totalBytes,
    startedAt: startedAt,
    completedAt: completedAt ?? this.completedAt,
    firstPlayedAt: firstPlayedAt ?? this.firstPlayedAt,
    error: error,
  );

  Map<String, dynamic> toMap() => {
    'contentId': contentId,
    'title': title,
    'quality': quality,
    'filePath': filePath,
    'status': status.name,
    'receivedBytes': receivedBytes,
    'totalBytes': totalBytes,
    'startedAt': startedAt.millisecondsSinceEpoch,
    'completedAt': completedAt?.millisecondsSinceEpoch,
    'firstPlayedAt': firstPlayedAt?.millisecondsSinceEpoch,
    'error': error,
  };

  factory DownloadRecord.fromMap(Map<dynamic, dynamic> map) {
    DateTime? ts(Object? v) => v == null ? null : DateTime.fromMillisecondsSinceEpoch(v as int);
    return DownloadRecord(
      contentId: map['contentId'] as String,
      title: map['title'] as String,
      quality: map['quality'] as String,
      filePath: map['filePath'] as String,
      status: DownloadStatus.values.byName(map['status'] as String),
      receivedBytes: map['receivedBytes'] as int,
      totalBytes: map['totalBytes'] as int,
      startedAt: ts(map['startedAt'])!,
      completedAt: ts(map['completedAt']),
      firstPlayedAt: ts(map['firstPlayedAt']),
      error: map['error'] as String?,
    );
  }
}

/// Industry-style offline rules: a download is kept for 30 days, but once
/// you start watching it you have 48 hours to finish.
abstract final class ExpiryPolicy {
  static const keepFor = Duration(days: 30);
  static const afterFirstPlay = Duration(hours: 48);

  static DateTime? expiresAt(DownloadRecord r) {
    final completed = r.completedAt;
    if (completed == null) return null;
    final byAge = completed.add(keepFor);
    final played = r.firstPlayedAt;
    if (played == null) return byAge;
    final byPlay = played.add(afterFirstPlay);
    return byPlay.isBefore(byAge) ? byPlay : byAge;
  }

  /// [now] should come from [TamperProofClock] so that winding the phone's
  /// clock back doesn't extend a download.
  static bool isExpired(DownloadRecord r, DateTime now) {
    final at = expiresAt(r);
    return at != null && !now.isBefore(at);
  }

  static Duration? timeLeft(DownloadRecord r, DateTime now) {
    final at = expiresAt(r);
    if (at == null) return null;
    final left = at.difference(now);
    return left.isNegative ? Duration.zero : left;
  }
}

/// A clock that never goes backwards. It remembers the latest time it has
/// seen, so setting the phone's date back returns that time instead.
class TamperProofClock {
  TamperProofClock({required int? lastSeenMs, required this.persist, DateTime Function()? system})
    : _lastSeenMs = lastSeenMs ?? 0,
      _system = system ?? DateTime.now;

  int _lastSeenMs;
  final void Function(int) persist;
  final DateTime Function() _system;

  DateTime now() {
    final sys = _system().millisecondsSinceEpoch;
    if (sys > _lastSeenMs) {
      _lastSeenMs = sys;
      persist(sys);
    }
    return DateTime.fromMillisecondsSinceEpoch(_lastSeenMs);
  }
}
