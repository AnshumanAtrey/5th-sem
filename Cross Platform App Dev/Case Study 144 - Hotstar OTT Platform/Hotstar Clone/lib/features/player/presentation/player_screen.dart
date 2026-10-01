import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:video_player/video_player.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

import '../../../core/storage/local_storage.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../account/data/account_repository.dart';
import '../../auth/data/auth_repository.dart';
import '../../catalog/data/catalog_repository.dart';
import '../../catalog/domain/content.dart';
import '../../downloads/data/downloads_controller.dart';
import '../../downloads/domain/download_record.dart';
import '../../progress/data/progress_repository.dart';
import '../../subscription/domain/plan.dart';
import '../application/playback_resolver.dart';
import '../application/subtitle_loader.dart';
import 'player_controls.dart';
import 'track_sheet.dart';

enum _Phase { preparing, ad, playing, error }

class PlayerScreen extends ConsumerStatefulWidget {
  const PlayerScreen({super.key, required this.contentId, this.offline = false});

  final String contentId;

  /// Play the downloaded file instead of streaming.
  final bool offline;

  @override
  ConsumerState<PlayerScreen> createState() => _PlayerScreenState();
}

class _PlayerScreenState extends ConsumerState<PlayerScreen> {
  _Phase _phase = _Phase.preparing;
  String? _error;
  VideoPlayerController? _controller;
  Content? _content;
  Plan _plan = Plan.free;
  PlaybackPlan? _playback;
  SubtitleTrack? _subtitle;
  String? _videoTrackId;
  String? _toast;
  Timer? _toastTimer;

  // Read in initState, because `ref` can't be used in dispose().
  late final ProgressRepository _progressRepo;
  String? _uid;
  DateTime _lastSave = DateTime.fromMillisecondsSinceEpoch(0);
  bool _wasPlaying = false;

  @override
  void initState() {
    super.initState();
    _progressRepo = ref.read(progressRepositoryProvider);
    _uid = ref.read(currentUserProvider)?.uid;
    SystemChrome.setPreferredOrientations([DeviceOrientation.landscapeLeft, DeviceOrientation.landscapeRight]);
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    _prepare();
  }

  @override
  void dispose() {
    _saveProgress();
    _toastTimer?.cancel();
    _controller?.removeListener(_onTick);
    _controller?.dispose();
    WakelockPlus.disable();
    SystemChrome.setPreferredOrientations([]);
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    super.dispose();
  }

  Future<void> _prepare() async {
    final old = _controller;
    _controller = null;
    old?.removeListener(_onTick);
    await old?.dispose();
    if (!mounted) return;
    setState(() {
      _phase = _Phase.preparing;
      _error = null;
    });
    try {
      final catalog = await ref.read(catalogProvider.future);
      final content = catalog.byId(widget.contentId);
      if (content == null) throw Exception('This title is no longer available.');
      _content = content;
      _plan = ref.read(effectivePlanProvider);

      final controller = widget.offline ? await _offlineController(content) : await _streamingController(content);
      _controller = controller..addListener(_onTick);

      final progress = ref.read(progressForProvider(content.id));
      if (progress != null && progress.isResumable) {
        await controller.seekTo(progress.position);
        _showToast('Resumed from ${formatClock(progress.position)}');
      }

      if (!mounted) return;
      if (_plan.showsAds && !widget.offline) {
        setState(() => _phase = _Phase.ad);
      } else {
        setState(() => _phase = _Phase.playing);
        await controller.play();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _phase = _Phase.error;
          _error = e.toString().replaceFirst('Exception: ', '');
        });
      }
    }
  }

  Future<VideoPlayerController> _offlineController(Content content) async {
    final downloads = ref.read(downloadsProvider.notifier);
    final record = ref.read(downloadsProvider)[content.id];
    if (record == null || !record.isCompleted) throw Exception('This title isn’t downloaded.');
    if (ExpiryPolicy.isExpired(record, downloads.now())) {
      await downloads.purgeExpired();
      throw Exception('This download has expired. Download it again to watch offline.');
    }
    final file = File(record.filePath);
    if (!await file.exists()) throw Exception('The downloaded file is missing. Download it again.');
    downloads.markPlayed(content.id);
    final controller = VideoPlayerController.file(file);
    await controller.initialize();
    return controller;
  }

  Future<VideoPlayerController> _streamingController(Content content) async {
    final playback = await PlaybackResolver.resolve(
      client: ref.read(httpClientProvider),
      url: content.stream.url,
      adaptive: content.stream.adaptive,
      maxHeight: _plan.maxHeight,
      cacheKey: content.id,
    );
    _playback = playback;
    var controller = playback.controller();
    try {
      await controller.initialize();
    } catch (e) {
      if (playback.cappedManifest == null) rethrow;
      // The local capped playlist didn't open on this device. Stream the
      // original and enforce the cap by pinning a track instead.
      debugPrint('capped manifest failed ($e), falling back');
      await controller.dispose();
      _playback = playback.withoutCap();
      controller = _playback!.controller();
      await controller.initialize();
      await _pinBestAllowedTrack(controller);
    }
    return controller;
  }

  /// Fallback cap: choose the tallest track the plan allows. This gives up
  /// adaptive switching, so it's only used when manifest filtering fails.
  Future<void> _pinBestAllowedTrack(VideoPlayerController c) async {
    if (!c.isVideoTrackSupportAvailable()) return;
    final tracks = await c.getVideoTracks();
    final allowed = tracks.where((t) => (t.height ?? 0) <= _plan.maxHeight).toList()
      ..sort((a, b) => (b.height ?? 0).compareTo(a.height ?? 0));
    if (allowed.isNotEmpty && allowed.length < tracks.length) {
      await c.selectVideoTrack(allowed.first);
      _videoTrackId = allowed.first.id;
    }
  }

  void _onTick() {
    final v = _controller?.value;
    if (v == null) return;
    if (v.hasError && _phase != _Phase.error) {
      setState(() {
        _phase = _Phase.error;
        _error = v.errorDescription ?? 'Playback failed.';
      });
      return;
    }
    if (v.isPlaying != _wasPlaying) {
      _wasPlaying = v.isPlaying;
      WakelockPlus.toggle(enable: v.isPlaying);
      if (!v.isPlaying) _saveProgress();
    }
    if (v.isPlaying && DateTime.now().difference(_lastSave) > const Duration(seconds: 10)) {
      _saveProgress();
    }
  }

  void _saveProgress() {
    final c = _controller;
    final uid = _uid;
    final content = _content;
    if (c == null || uid == null || content == null || !c.value.isInitialized) return;
    if (c.value.duration <= Duration.zero || c.value.position <= Duration.zero) return;
    _lastSave = DateTime.now();
    _progressRepo.save(
      uid,
      WatchProgress(
        contentId: content.id,
        position: c.value.position,
        duration: c.value.duration,
        updatedAt: DateTime.now(),
      ),
    );
  }

  void _showToast(String message) {
    _toastTimer?.cancel();
    setState(() => _toast = message);
    _toastTimer = Timer(const Duration(seconds: 4), () {
      if (mounted) setState(() => _toast = null);
    });
  }

  Future<void> _setSubtitle(SubtitleTrack? track) async {
    final c = _controller;
    if (c == null) return;
    if (track == null) {
      await c.setClosedCaptionFile(null);
      setState(() => _subtitle = null);
      return;
    }
    try {
      await c.setClosedCaptionFile(SubtitleLoader.load(ref.read(httpClientProvider), track.url));
      if (mounted) setState(() => _subtitle = track);
    } catch (e) {
      if (mounted) _showToast("Couldn't load ${track.label} subtitles");
    }
  }

  Future<void> _setQuality(VideoTrack? track) async {
    await _controller?.selectVideoTrack(track);
    _videoTrackId = track?.id;
    _showToast(track == null ? 'Quality: Auto' : 'Quality: ${track.height}p');
  }

  void _openSettings() {
    final c = _controller;
    final content = _content;
    if (c == null || content == null) return;
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (_) => TrackSheet(
        controller: c,
        lockedHeights: _playback?.lockedHeights ?? const [],
        maxHeight: _plan.maxHeight,
        subtitles: content.subtitles,
        selectedSubtitle: _subtitle,
        selectedVideoTrackId: _videoTrackId,
        onQuality: _setQuality,
        onSubtitle: _setSubtitle,
      ),
    );
  }

  void _close() => context.canPop() ? context.pop() : context.go('/');

  @override
  Widget build(BuildContext context) {
    final content = _content;
    return Scaffold(
      backgroundColor: Colors.black,
      body: switch (_phase) {
        _Phase.preparing => const Center(child: CircularProgressIndicator(color: Colors.white)),
        _Phase.error => _ErrorPane(message: _error ?? 'Playback failed.', onRetry: _prepare, onBack: _close),
        _Phase.ad => AdBreak(
          onFinished: () {
            setState(() => _phase = _Phase.playing);
            _controller?.play();
          },
          onUpgrade: () => context.push('/plans'),
        ),
        _Phase.playing => Stack(
          fit: StackFit.expand,
          children: [
            PlayerView(
              controller: _controller!,
              title: content!.title,
              subtitle: [
                content.rating.label,
                if (widget.offline) 'Offline' else 'Up to ${_plan.qualityLabel}',
              ].join(' · '),
              onBack: _close,
              onSettings: widget.offline ? null : _openSettings,
              captionsOn: _subtitle != null,
              onToggleCaptions: content.subtitles.isEmpty || widget.offline
                  ? null
                  : () => _setSubtitle(_subtitle == null ? content.subtitles.first : null),
            ),
            Positioned(
              top: 16,
              left: 0,
              right: 0,
              child: IgnorePointer(
                child: AnimatedOpacity(
                  opacity: _toast == null ? 0 : 1,
                  duration: const Duration(milliseconds: 200),
                  child: Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceHighest.withValues(alpha: 0.92),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(_toast ?? '', style: const TextStyle(fontWeight: FontWeight.w700)),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      },
    );
  }
}

class _ErrorPane extends StatelessWidget {
  const _ErrorPane({required this.message, required this.onRetry, required this.onBack});

  final String message;
  final VoidCallback onRetry;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) => SafeArea(
    child: Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error_outline_rounded, color: AppColors.live, size: 42),
            const SizedBox(height: 12),
            Text(message, textAlign: TextAlign.center, style: const TextStyle(fontSize: 15)),
            const SizedBox(height: 18),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                OutlinedButton(onPressed: onBack, child: const Text('Back')),
                const SizedBox(width: 12),
                FilledButton(onPressed: onRetry, child: const Text('Try again')),
              ],
            ),
          ],
        ),
      ),
    ),
  );
}
