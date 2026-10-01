import 'dart:async';

import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/badges.dart';

/// The video surface, captions and an auto-hiding control overlay.
class PlayerView extends StatefulWidget {
  const PlayerView({
    super.key,
    required this.controller,
    required this.title,
    this.subtitle,
    this.liveLabel,
    this.onBack,
    this.onSettings,
    this.captionsOn = false,
    this.onToggleCaptions,
    this.compact = false,
  });

  final VideoPlayerController controller;
  final String title;
  final String? subtitle;

  /// Set for live streams: hides the scrubber and shows this badge.
  final String? liveLabel;
  final VoidCallback? onBack;
  final VoidCallback? onSettings;
  final bool captionsOn;
  final VoidCallback? onToggleCaptions;

  /// Smaller controls for the embedded live player.
  final bool compact;

  @override
  State<PlayerView> createState() => _PlayerViewState();
}

class _PlayerViewState extends State<PlayerView> {
  bool _visible = true;
  Timer? _hideTimer;
  double? _dragMs;
  String? _seekFlash;
  Timer? _flashTimer;

  VideoPlayerController get _c => widget.controller;
  bool get _isLive => widget.liveLabel != null;

  @override
  void initState() {
    super.initState();
    _scheduleHide();
  }

  @override
  void dispose() {
    _hideTimer?.cancel();
    _flashTimer?.cancel();
    super.dispose();
  }

  void _scheduleHide() {
    _hideTimer?.cancel();
    _hideTimer = Timer(const Duration(seconds: 3), () {
      if (mounted && _c.value.isPlaying && _dragMs == null) setState(() => _visible = false);
    });
  }

  void _poke() {
    setState(() => _visible = true);
    _scheduleHide();
  }

  void _togglePlay() {
    final v = _c.value;
    if (v.isCompleted || (v.duration > Duration.zero && v.position >= v.duration)) {
      _c.seekTo(Duration.zero);
      _c.play();
    } else {
      v.isPlaying ? _c.pause() : _c.play();
    }
    _poke();
  }

  void _seekBy(Duration delta) {
    if (_isLive) return;
    final v = _c.value;
    var target = v.position + delta;
    if (target < Duration.zero) target = Duration.zero;
    if (target > v.duration) target = v.duration;
    _c.seekTo(target);
    _flashTimer?.cancel();
    setState(() => _seekFlash = delta.isNegative ? '−10s' : '+10s');
    _flashTimer = Timer(const Duration(milliseconds: 700), () {
      if (mounted) setState(() => _seekFlash = null);
    });
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<VideoPlayerValue>(
      valueListenable: _c,
      builder: (context, v, _) {
        final showControls = _visible || !v.isPlaying;
        return LayoutBuilder(
          builder: (context, box) => GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () => showControls && v.isPlaying ? setState(() => _visible = false) : _poke(),
            onDoubleTapDown: (d) => _seekBy(Duration(seconds: d.localPosition.dx < box.maxWidth / 2 ? -10 : 10)),
            onDoubleTap: () {},
            child: Stack(
              fit: StackFit.expand,
              children: [
                const ColoredBox(color: Colors.black),
                if (v.isInitialized)
                  Center(
                    child: AspectRatio(aspectRatio: v.aspectRatio > 0 ? v.aspectRatio : 16 / 9, child: VideoPlayer(_c)),
                  ),
                if (widget.captionsOn)
                  AnimatedPositioned(
                    duration: const Duration(milliseconds: 200),
                    left: 24,
                    right: 24,
                    bottom: showControls ? (widget.compact ? 54 : 88) : 24,
                    child: ClosedCaption(
                      text: v.caption.text,
                      textStyle: TextStyle(
                        fontFamily: 'Manrope',
                        fontSize: widget.compact ? 14 : 18,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                        height: 1.3,
                      ),
                    ),
                  ),
                if (_seekFlash != null)
                  Align(
                    alignment: _seekFlash!.startsWith('−') ? const Alignment(-0.6, 0) : const Alignment(0.6, 0),
                    child: _Pill(text: _seekFlash!),
                  ),
                IgnorePointer(
                  ignoring: !showControls,
                  child: AnimatedOpacity(
                    duration: const Duration(milliseconds: 200),
                    opacity: showControls ? 1 : 0,
                    child: _overlay(context, v),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _overlay(BuildContext context, VideoPlayerValue v) {
    final iconSize = widget.compact ? 44.0 : 60.0;
    final duration = v.duration;
    final position = _dragMs != null ? Duration(milliseconds: _dragMs!.round()) : v.position;
    final ended = v.isCompleted || (duration > Duration.zero && v.position >= duration);

    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          stops: [0, 0.25, 0.7, 1],
          colors: [Color(0xB3000000), Colors.transparent, Colors.transparent, Color(0xCC000000)],
        ),
      ),
      child: SafeArea(
        child: Stack(
          children: [
            Positioned(
              top: 4,
              left: 4,
              right: 4,
              child: Row(
                children: [
                  if (widget.onBack != null)
                    IconButton(
                      tooltip: 'Back',
                      onPressed: widget.onBack,
                      icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
                    ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          widget.title,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(fontWeight: FontWeight.w800, fontSize: widget.compact ? 14 : 17),
                        ),
                        if (widget.subtitle != null)
                          Text(widget.subtitle!, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                      ],
                    ),
                  ),
                  if (widget.onToggleCaptions != null)
                    IconButton(
                      tooltip: widget.captionsOn ? 'Subtitles off' : 'Subtitles',
                      onPressed: widget.onToggleCaptions,
                      icon: Icon(
                        widget.captionsOn ? Icons.closed_caption_rounded : Icons.closed_caption_off_outlined,
                        color: Colors.white,
                      ),
                    ),
                  if (widget.onSettings != null)
                    IconButton(
                      tooltip: 'Quality, audio & subtitles',
                      onPressed: widget.onSettings,
                      icon: const Icon(Icons.tune_rounded, color: Colors.white),
                    ),
                ],
              ),
            ),
            Center(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (!_isLive)
                    IconButton(
                      tooltip: 'Back 10 seconds',
                      iconSize: iconSize * 0.6,
                      onPressed: () => _seekBy(const Duration(seconds: -10)),
                      icon: const Icon(Icons.replay_10_rounded, color: Colors.white),
                    ),
                  SizedBox(width: widget.compact ? 12 : 28),
                  SizedBox(
                    width: iconSize + 12,
                    height: iconSize + 12,
                    child: v.isBuffering && v.isPlaying
                        ? const Padding(
                            padding: EdgeInsets.all(14),
                            child: CircularProgressIndicator(color: Colors.white),
                          )
                        : IconButton(
                            tooltip: ended ? 'Replay' : (v.isPlaying ? 'Pause' : 'Play'),
                            iconSize: iconSize,
                            onPressed: _togglePlay,
                            icon: Icon(
                              ended
                                  ? Icons.replay_rounded
                                  : (v.isPlaying ? Icons.pause_rounded : Icons.play_arrow_rounded),
                              color: Colors.white,
                            ),
                          ),
                  ),
                  SizedBox(width: widget.compact ? 12 : 28),
                  if (!_isLive)
                    IconButton(
                      tooltip: 'Forward 10 seconds',
                      iconSize: iconSize * 0.6,
                      onPressed: () => _seekBy(const Duration(seconds: 10)),
                      icon: const Icon(Icons.forward_10_rounded, color: Colors.white),
                    ),
                ],
              ),
            ),
            Positioned(
              left: 12,
              right: 12,
              bottom: widget.compact ? 4 : 8,
              child: _isLive
                  ? Row(children: [LiveBadge(label: widget.liveLabel!)])
                  : Row(
                      children: [
                        Text(formatClock(position), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                        Expanded(
                          child: Slider(
                            min: 0,
                            max: duration.inMilliseconds <= 0 ? 1 : duration.inMilliseconds.toDouble(),
                            value: position.inMilliseconds
                                .clamp(0, duration.inMilliseconds <= 0 ? 1 : duration.inMilliseconds)
                                .toDouble(),
                            onChangeStart: (x) {
                              _hideTimer?.cancel();
                              setState(() => _dragMs = x);
                            },
                            onChanged: (x) => setState(() => _dragMs = x),
                            onChangeEnd: (x) async {
                              await _c.seekTo(Duration(milliseconds: x.round()));
                              if (mounted) setState(() => _dragMs = null);
                              _scheduleHide();
                            },
                          ),
                        ),
                        Text(
                          '-${formatClock(duration - position)}',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.white70),
                        ),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
    decoration: BoxDecoration(color: const Color(0x99000000), borderRadius: BorderRadius.circular(20)),
    child: Text(text, style: const TextStyle(fontWeight: FontWeight.w800)),
  );
}

/// Pre-roll house ad for the Free tier: 10 s, skippable after 5 s.
class AdBreak extends StatefulWidget {
  const AdBreak({super.key, required this.onFinished, required this.onUpgrade});

  final VoidCallback onFinished;
  final VoidCallback onUpgrade;

  static const length = Duration(seconds: 10);
  static const skippableAfter = Duration(seconds: 5);

  @override
  State<AdBreak> createState() => _AdBreakState();
}

class _AdBreakState extends State<AdBreak> {
  late final Timer _timer;
  int _elapsed = 0;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      setState(() => _elapsed++);
      if (_elapsed >= AdBreak.length.inSeconds) {
        t.cancel();
        widget.onFinished();
      }
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final left = AdBreak.length.inSeconds - _elapsed;
    final skipIn = AdBreak.skippableAfter.inSeconds - _elapsed;
    return DecoratedBox(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1B1030), Color(0xFF0B1B3A), Color(0xFF3A2400)],
        ),
      ),
      child: SafeArea(
        child: Stack(
          children: [
            Positioned(top: 12, left: 16, child: _Pill(text: 'Ad · 0:${left.toString().padLeft(2, '0')}')),
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.workspace_premium_rounded, color: AppColors.gold, size: 44),
                    const SizedBox(height: 10),
                    Text(
                      'Go ad-free with Premium',
                      style: Theme.of(context).textTheme.headlineSmall,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 6),
                    const Text(
                      '4K · 4 screens · family sharing · ₹1,499/year',
                      style: TextStyle(color: Colors.white70),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    FilledButton(onPressed: widget.onUpgrade, child: const Text('See plans')),
                  ],
                ),
              ),
            ),
            Positioned(
              right: 16,
              bottom: 16,
              child: skipIn > 0
                  ? _Pill(text: 'Skip in $skipIn')
                  : FilledButton.tonalIcon(
                      onPressed: () {
                        _timer.cancel();
                        widget.onFinished();
                      },
                      icon: const Icon(Icons.skip_next_rounded),
                      label: const Text('Skip ad'),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
