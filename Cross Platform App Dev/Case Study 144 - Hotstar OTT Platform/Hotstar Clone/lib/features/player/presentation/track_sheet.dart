import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/badges.dart';
import '../../catalog/domain/content.dart';
import '../../subscription/domain/access_policy.dart';
import '../../subscription/presentation/upgrade_sheet.dart';

const _languageNames = {
  'en': 'English',
  'eng': 'English',
  'it': 'Italiano',
  'ita': 'Italiano',
  'hi': 'हिन्दी',
  'hin': 'हिन्दी',
  'bn': 'বাংলা',
  'ta': 'தமிழ்',
  'te': 'తెలుగు',
  'ml': 'മലയാളം',
  'de': 'Deutsch',
  'deu': 'Deutsch',
  'ger': 'Deutsch',
  'fr': 'Français',
  'fra': 'Français',
  'fre': 'Français',
  'es': 'Español',
  'spa': 'Español',
};

String audioTrackName(VideoAudioTrack t, int index) {
  final label = t.label?.trim();
  if (label != null && label.isNotEmpty && label.toLowerCase() != 'und') return label;
  final lang = t.language?.toLowerCase();
  return _languageNames[lang] ?? (lang == null || lang == 'und' ? 'Track ${index + 1}' : lang.toUpperCase());
}

class TrackSheet extends StatefulWidget {
  const TrackSheet({
    super.key,
    required this.controller,
    required this.lockedHeights,
    required this.maxHeight,
    required this.subtitles,
    required this.selectedSubtitle,
    required this.selectedVideoTrackId,
    required this.onQuality,
    required this.onSubtitle,
  });

  final VideoPlayerController controller;
  final List<int> lockedHeights;

  /// The plan's cap. Also enforced here in case the capped manifest failed
  /// and the player fell back to the full ladder.
  final int maxHeight;
  final List<SubtitleTrack> subtitles;
  final SubtitleTrack? selectedSubtitle;
  final String? selectedVideoTrackId;
  final Future<void> Function(VideoTrack? track) onQuality;
  final Future<void> Function(SubtitleTrack? track) onSubtitle;

  @override
  State<TrackSheet> createState() => _TrackSheetState();
}

class _TrackSheetState extends State<TrackSheet> {
  late final Future<List<VideoTrack>> _video = _loadVideo();
  late Future<List<VideoAudioTrack>> _audio = _loadAudio();
  late String? _videoId = widget.selectedVideoTrackId;
  late SubtitleTrack? _subtitle = widget.selectedSubtitle;

  Future<List<VideoTrack>> _loadVideo() async {
    if (!widget.controller.isVideoTrackSupportAvailable()) return const [];
    final tracks = await widget.controller.getVideoTracks();
    // One row per height: keep the highest bitrate at each size.
    final byHeight = <int, VideoTrack>{};
    for (final t in tracks) {
      final h = t.height;
      if (h == null) continue;
      if ((byHeight[h]?.bitrate ?? -1) < (t.bitrate ?? 0)) byHeight[h] = t;
    }
    return byHeight.values.toList()..sort((a, b) => (b.height ?? 0).compareTo(a.height ?? 0));
  }

  Future<List<VideoAudioTrack>> _loadAudio() async {
    if (!widget.controller.isAudioTrackSupportAvailable()) return const [];
    return widget.controller.getAudioTracks();
  }

  Widget _option({
    required String title,
    String? subtitle,
    required bool selected,
    required VoidCallback? onTap,
    Widget? trailing,
  }) => ListTile(
    onTap: onTap,
    enabled: onTap != null || trailing != null,
    leading: Icon(
      selected ? Icons.radio_button_checked_rounded : Icons.radio_button_off_rounded,
      color: selected ? AppColors.primary : Colors.white38,
    ),
    title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
    subtitle: subtitle == null ? null : Text(subtitle),
    trailing: trailing,
  );

  Widget _quality() => FutureBuilder<List<VideoTrack>>(
    future: _video,
    builder: (context, snap) {
      if (!snap.hasData) return const Center(child: CircularProgressIndicator());
      final tracks = snap.data!.where((t) => t.height! <= widget.maxHeight).toList();
      final locked = {
        ...widget.lockedHeights,
        for (final t in snap.data!)
          if (t.height! > widget.maxHeight) t.height!,
      }.toList()..sort((a, b) => b.compareTo(a));
      return ListView(
        children: [
          _option(
            title: 'Auto',
            subtitle: tracks.isEmpty ? 'This stream picks its own quality' : 'Adapts to your network (recommended)',
            selected: _videoId == null,
            onTap: () async {
              await widget.onQuality(null);
              setState(() => _videoId = null);
            },
          ),
          for (final t in tracks)
            _option(
              title: t.height! >= 2160 ? '4K · ${t.height}p' : '${t.height}p',
              subtitle: t.bitrate == null ? null : '${(t.bitrate! / 1e6).toStringAsFixed(1)} Mbps',
              selected: _videoId == t.id,
              onTap: () async {
                await widget.onQuality(t);
                setState(() => _videoId = t.id);
              },
            ),
          for (final h in locked)
            _option(
              title: h >= 2160 ? '4K · ${h}p' : '${h}p',
              subtitle: 'Not included in your plan',
              selected: false,
              onTap: null,
              trailing: TierBadge(
                AccessPolicy.planForHeight(h),
                onTap: () {
                  final plan = AccessPolicy.planForHeight(h);
                  showUpgradeSheet(context, required: plan, reason: '${h}p needs ${plan.label}');
                },
              ),
            ),
        ],
      );
    },
  );

  Widget _audioTab() => FutureBuilder<List<VideoAudioTrack>>(
    future: _audio,
    builder: (context, snap) {
      if (!snap.hasData) return const Center(child: CircularProgressIndicator());
      final tracks = snap.data!;
      if (tracks.length <= 1) {
        return const Center(
          child: Padding(
            padding: EdgeInsets.all(24),
            child: Text('This title has a single audio track.', style: TextStyle(color: AppColors.textMuted)),
          ),
        );
      }
      return ListView(
        children: [
          for (final (i, t) in tracks.indexed)
            _option(
              title: audioTrackName(t, i),
              subtitle: [
                if (t.channelCount != null) t.channelCount! >= 6 ? '5.1 surround' : 'Stereo',
                if (t.codec != null) t.codec!,
              ].join(' · '),
              selected: t.isSelected,
              onTap: () async {
                await widget.controller.selectAudioTrack(t.id);
                setState(() => _audio = _loadAudio());
              },
            ),
        ],
      );
    },
  );

  Widget _subtitlesTab() => ListView(
    children: [
      _option(
        title: 'Off',
        selected: _subtitle == null,
        onTap: () async {
          await widget.onSubtitle(null);
          setState(() => _subtitle = null);
        },
      ),
      for (final s in widget.subtitles)
        _option(
          title: s.label,
          subtitle: s.language,
          selected: _subtitle?.language == s.language,
          onTap: () async {
            setState(() => _subtitle = s);
            await widget.onSubtitle(s);
          },
        ),
    ],
  );

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: SizedBox(
        height: (MediaQuery.sizeOf(context).height * 0.7).clamp(260.0, 460.0),
        child: Column(
          children: [
            const TabBar(
              tabs: [
                Tab(text: 'Quality'),
                Tab(text: 'Audio'),
                Tab(text: 'Subtitles'),
              ],
            ),
            Expanded(child: TabBarView(children: [_quality(), _audioTab(), _subtitlesTab()])),
          ],
        ),
      ),
    );
  }
}
