import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';

import '../../../core/storage/local_storage.dart';
import '../../catalog/domain/content.dart';
import '../domain/download_record.dart';

/// Downloads a title's progressive file (MP4/MOV) for offline viewing.
///
/// Why not download the HLS stream? That means fetching hundreds of segments
/// per quality and rewriting playlists, which needs native download managers
/// (ExoPlayer DownloadService, AVAssetDownloadTask). A single progressive
/// file downloaded with HTTP Range requests gives pause/resume with plain
/// Dart. Real OTTs also encrypt it with DRM; this app doesn't.
class DownloadsController extends Notifier<Map<String, DownloadRecord>> {
  /// Bumped on every start/pause/resume/delete. A running download stops as
  /// soon as its generation is no longer the current one.
  final _generation = <String, int>{};
  final _running = <String, Future<void>>{};
  late TamperProofClock _clock;

  int _bump(String id) => _generation[id] = (_generation[id] ?? 0) + 1;

  void _launch(String id, Uri url) {
    final gen = _bump(id);
    final previous = _running[id] ?? Future<void>.value();
    // Wait for any older run to close the file before appending to it.
    _running[id] = previous.then((_) => _run(id, url, gen));
  }

  @override
  Map<String, DownloadRecord> build() {
    final meta = ref.watch(metaBoxProvider);
    _clock = TamperProofClock(lastSeenMs: meta.get('lastSeenMs') as int?, persist: (ms) => meta.put('lastSeenMs', ms));
    final box = ref.watch(downloadsBoxProvider);
    final records = <String, DownloadRecord>{};
    for (final raw in box.values) {
      var r = DownloadRecord.fromMap(raw as Map);
      // The app was killed mid-download; the partial file is kept, so resume works.
      if (r.status == DownloadStatus.downloading) r = r.copyWith(status: DownloadStatus.paused);
      records[r.contentId] = r;
    }
    Future.microtask(purgeExpired);
    return records;
  }

  DateTime now() => _clock.now();

  Future<void> start(Content content) async {
    final source = content.download;
    if (source == null) return;
    final existing = state[content.id];
    if (existing != null && existing.status != DownloadStatus.expired) return;
    if (existing != null) await _deleteFile(existing);

    final dir = Directory('${(await getApplicationDocumentsDirectory()).path}/downloads');
    await dir.create(recursive: true);
    final ext = source.url.path.split('.').last.toLowerCase();
    final record = DownloadRecord(
      contentId: content.id,
      title: content.title,
      quality: source.label,
      filePath: '${dir.path}/${content.id}.$ext',
      status: DownloadStatus.downloading,
      receivedBytes: 0,
      totalBytes: source.sizeMb * 1024 * 1024,
      startedAt: now(),
    );
    _put(record);
    _launch(content.id, source.url);
  }

  void pause(String id) {
    final r = state[id];
    if (r == null || r.status != DownloadStatus.downloading) return;
    _bump(id);
    _put(r.copyWith(status: DownloadStatus.paused));
  }

  void resume(String id, Uri url) {
    final r = state[id];
    if (r == null || !(r.status == DownloadStatus.paused || r.status == DownloadStatus.failed)) return;
    _put(r.copyWith(status: DownloadStatus.downloading));
    _launch(id, url);
  }

  Future<void> delete(String id) async {
    final r = state[id];
    if (r == null) return;
    _bump(id);
    await _running[id];
    await _deleteFile(r);
    await ref.read(downloadsBoxProvider).delete(id);
    state = {...state}..remove(id);
  }

  /// Starts the 48-hour watch window the first time an offline copy is played.
  void markPlayed(String id) {
    final r = state[id];
    if (r == null || r.firstPlayedAt != null) return;
    _put(r.copyWith(firstPlayedAt: now()));
  }

  Future<void> purgeExpired() async {
    final t = now();
    for (final r in state.values.toList()) {
      if (r.isCompleted && ExpiryPolicy.isExpired(r, t)) {
        await _deleteFile(r);
        _put(r.copyWith(status: DownloadStatus.expired));
      }
    }
  }

  Future<void> _run(String id, Uri url, int gen) async {
    bool stale() => _generation[id] != gen || state[id] == null;
    if (stale()) return;
    final client = ref.read(httpClientProvider);
    var record = state[id]!;
    final file = File(record.filePath);
    var received = await file.exists() ? await file.length() : 0;

    IOSink? sink;
    try {
      final request = http.Request('GET', url);
      if (received > 0) request.headers['range'] = 'bytes=$received-';
      final response = await client.send(request);

      if (response.statusCode == 200) {
        received = 0; // Server ignored the Range header: start over.
      } else if (response.statusCode != 206) {
        throw HttpException('Server replied ${response.statusCode}');
      }
      final total = response.contentLength == null ? record.totalBytes : received + response.contentLength!;
      sink = file.openWrite(mode: received == 0 ? FileMode.write : FileMode.append);

      var lastEmit = DateTime.now();
      await for (final chunk in response.stream) {
        if (stale()) break;
        sink.add(chunk);
        received += chunk.length;
        if (DateTime.now().difference(lastEmit) > const Duration(milliseconds: 300)) {
          lastEmit = DateTime.now();
          record = state[id]!.copyWith(receivedBytes: received, totalBytes: total);
          _put(record, persist: false);
        }
      }
      await sink.flush();
      await sink.close();
      sink = null;

      if (stale()) {
        if (state[id] case final current?) _put(current.copyWith(receivedBytes: received));
        return;
      }
      _put(
        state[id]!.copyWith(
          status: DownloadStatus.completed,
          receivedBytes: received,
          totalBytes: received,
          completedAt: now(),
        ),
      );
    } catch (e) {
      await sink?.close();
      debugPrint('download $id failed: $e');
      if (state[id] case final current? when !stale() && current.status == DownloadStatus.downloading) {
        _put(current.copyWith(status: DownloadStatus.failed, receivedBytes: received, error: '$e'));
      }
    }
  }

  void _put(DownloadRecord r, {bool persist = true}) {
    state = {...state, r.contentId: r};
    if (persist) ref.read(downloadsBoxProvider).put(r.contentId, r.toMap());
  }

  Future<void> _deleteFile(DownloadRecord r) async {
    final f = File(r.filePath);
    if (await f.exists()) await f.delete();
  }
}

final downloadsProvider = NotifierProvider<DownloadsController, Map<String, DownloadRecord>>(DownloadsController.new);
