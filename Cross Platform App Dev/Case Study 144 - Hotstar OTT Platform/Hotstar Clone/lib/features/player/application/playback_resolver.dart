import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:video_player/video_player.dart';

import '../domain/hls_manifest.dart';

/// What the player should open, plus what the viewer's plan hides.
class PlaybackPlan {
  const PlaybackPlan({required this.url, this.cappedManifest, this.ladder = const [], this.lockedHeights = const []});

  final Uri url;

  /// A local copy of the master playlist with over-cap renditions removed.
  final File? cappedManifest;

  /// Every height in the stream's ladder, highest first.
  final List<int> ladder;

  /// Heights the viewer's plan doesn't include (shown as locked).
  final List<int> lockedHeights;

  VideoPlayerController controller() {
    final options = VideoPlayerOptions(mixWithOthers: false);
    final file = cappedManifest;
    if (file != null) return VideoPlayerController.file(file, videoPlayerOptions: options);
    return VideoPlayerController.networkUrl(url, videoPlayerOptions: options);
  }

  PlaybackPlan withoutCap() => PlaybackPlan(url: url, ladder: ladder);
}

abstract final class PlaybackResolver {
  static Future<PlaybackPlan> resolve({
    required http.Client client,
    required Uri url,
    required bool adaptive,
    required int maxHeight,
    required String cacheKey,
  }) async {
    if (!adaptive) return PlaybackPlan(url: url);
    try {
      final res = await client.get(url).timeout(const Duration(seconds: 10));
      if (res.statusCode != 200) return PlaybackPlan(url: url);
      final master = utf8.decode(res.bodyBytes, allowMalformed: true);
      if (!HlsManifest.isMaster(master)) return PlaybackPlan(url: url);

      final ladder = HlsManifest.heights(master);
      if (!HlsManifest.needsCap(master, maxHeight)) return PlaybackPlan(url: url, ladder: ladder);

      final dir = Directory('${(await getTemporaryDirectory()).path}/manifests');
      await dir.create(recursive: true);
      final file = File('${dir.path}/$cacheKey-${maxHeight}p.m3u8');
      await file.writeAsString(HlsManifest.capped(master, base: url, maxHeight: maxHeight));
      return PlaybackPlan(
        url: url,
        cappedManifest: file,
        ladder: ladder,
        lockedHeights: ladder.where((h) => h > maxHeight).toList(),
      );
    } catch (e) {
      // Manifest fetch failed: let the player try the URL directly.
      debugPrint('manifest resolve failed for $url: $e');
      return PlaybackPlan(url: url);
    }
  }
}
