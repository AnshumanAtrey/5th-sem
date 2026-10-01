import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/badges.dart';
import '../../../core/widgets/content_cards.dart';
import '../../catalog/application/title_actions.dart';
import '../../catalog/data/catalog_repository.dart';
import '../../catalog/domain/content.dart';

class LiveScreen extends ConsumerWidget {
  const LiveScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catalog = ref.watch(catalogProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Live')),
      body: catalog.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ErrorView(error: e, onRetry: () => ref.invalidate(catalogProvider)),
        data: (c) => LayoutBuilder(
          builder: (context, box) {
            final columns = box.maxWidth >= 840 ? 2 : 1;
            final hasStudio = c.live.any((l) => l.kind == LiveKind.studio);
            return CustomScrollView(
              slivers: [
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                  sliver: SliverGrid.builder(
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: columns,
                      mainAxisSpacing: 16,
                      crossAxisSpacing: 16,
                      childAspectRatio: 16 / 12,
                    ),
                    itemCount: c.live.length,
                    itemBuilder: (context, i) => _LiveTile(channel: c.live[i]),
                  ),
                ),
                if (!hasStudio && kDebugMode) const SliverToBoxAdapter(child: _GoLiveHint()),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _LiveTile extends ConsumerWidget {
  const _LiveTile({required this.channel});

  final LiveChannel channel;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final label = switch (channel.kind) {
      LiveKind.live => 'LIVE',
      LiveKind.watchParty => 'WATCH PARTY',
      LiveKind.studio => 'STUDIO LIVE',
    };
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: () => joinLive(context, ref, channel),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (channel.backdrop != null)
                    Artwork(channel.backdrop)
                  else
                    const DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(colors: [Color(0xFF3B1D5E), Color(0xFF0B1B3A)]),
                      ),
                      child: Center(child: Icon(Icons.videocam_rounded, size: 54, color: Colors.white54)),
                    ),
                  const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        stops: [0.5, 1],
                        colors: [Colors.transparent, Color(0xCC000000)],
                      ),
                    ),
                  ),
                  Positioned(top: 10, left: 10, child: LiveBadge(label: label)),
                  const Center(
                    child: CircleAvatar(
                      radius: 26,
                      backgroundColor: Color(0x99000000),
                      child: Icon(Icons.play_arrow_rounded, size: 32, color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          Text(channel.title, style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 2),
          Text(channel.subtitle, style: const TextStyle(color: AppColors.textMuted)),
        ],
      ),
    );
  }
}

/// Only in debug builds: how to add your own live channel.
class _GoLiveHint extends StatelessWidget {
  const _GoLiveHint();

  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.fromLTRB(16, 0, 16, 32),
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(14),
      border: Border.all(color: AppColors.outline),
    ),
    child: const Text(
      'Dev tip: run MediaMTX on your laptop, stream to it from OBS '
      '(rtmp://<laptop-ip>:1935/studio), then start the app with\n'
      '--dart-define=LIVE_URL=http://<laptop-ip>:8888/studio/index.m3u8\n'
      'and a "Hotstar Clone Studio" channel appears here.',
      style: TextStyle(color: AppColors.textMuted, height: 1.5),
    ),
  );
}
