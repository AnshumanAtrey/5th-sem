import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/content_cards.dart';
import '../../account/data/account_repository.dart';
import '../../catalog/application/title_actions.dart';
import '../../catalog/data/catalog_repository.dart';
import '../../subscription/domain/plan.dart';
import '../../subscription/presentation/upgrade_sheet.dart';
import '../data/downloads_controller.dart';
import '../domain/download_record.dart';

class DownloadsScreen extends ConsumerStatefulWidget {
  const DownloadsScreen({super.key});

  @override
  ConsumerState<DownloadsScreen> createState() => _DownloadsScreenState();
}

class _DownloadsScreenState extends ConsumerState<DownloadsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(downloadsProvider.notifier).purgeExpired());
  }

  Future<void> _confirmDelete(DownloadRecord r) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Delete download?'),
        content: Text('${r.title} will be removed from this device.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(dialogContext, false), child: const Text('Cancel')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.live),
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (ok == true) await ref.read(downloadsProvider.notifier).delete(r.contentId);
  }

  @override
  Widget build(BuildContext context) {
    final records = ref.watch(downloadsProvider).values.toList()..sort((a, b) => b.startedAt.compareTo(a.startedAt));
    final controller = ref.read(downloadsProvider.notifier);
    final plan = ref.watch(effectivePlanProvider);
    final catalog = ref.watch(catalogProvider).value;
    final used = records.where((r) => r.status != DownloadStatus.expired).fold<int>(0, (s, r) => s + r.receivedBytes);

    return Scaffold(
      appBar: AppBar(title: const Text('Downloads')),
      body: records.isEmpty
          ? EmptyState(
              icon: Icons.download_for_offline_outlined,
              title: 'No downloads yet',
              message: plan.allowsDownloads
                  ? 'Download a title to watch it without internet. Downloads last 30 days, or 48 hours after you start watching.'
                  : 'Downloads are included with Mobile, Super and Premium.',
              action: plan.allowsDownloads
                  ? FilledButton(onPressed: () => context.go('/'), child: const Text('Find something to watch'))
                  : FilledButton(onPressed: () => context.push('/plans'), child: const Text('See plans')),
            )
          : ListView(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
              children: [
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(14)),
                  child: Row(
                    children: [
                      const Icon(Icons.sd_storage_outlined, color: AppColors.textMuted),
                      const SizedBox(width: 12),
                      Expanded(child: Text('${formatBytes(used)} used by Hotstar Clone on this device')),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                for (final r in records)
                  _DownloadTile(
                    record: r,
                    poster: catalog?.byId(r.contentId)?.poster,
                    now: controller.now(),
                    onPlay: () {
                      if (!plan.allowsDownloads) {
                        showUpgradeSheet(
                          context,
                          required: Plan.mobile,
                          reason: 'Offline viewing needs Mobile or higher',
                        );
                        return;
                      }
                      final content = catalog?.byId(r.contentId);
                      if (content == null) return;
                      ensureParentalAccess(context, ref, id: content.id, rating: content.rating).then((ok) {
                        if (ok && context.mounted) context.push('/watch/${r.contentId}?offline=1');
                      });
                    },
                    onPause: () => controller.pause(r.contentId),
                    onResume: () {
                      final url = catalog?.byId(r.contentId)?.download?.url;
                      if (url != null) controller.resume(r.contentId, url);
                    },
                    onRedownload: () {
                      final content = catalog?.byId(r.contentId);
                      if (content != null) controller.start(content);
                    },
                    onDelete: () => _confirmDelete(r),
                  ),
              ],
            ),
    );
  }
}

class _DownloadTile extends StatelessWidget {
  const _DownloadTile({
    required this.record,
    required this.poster,
    required this.now,
    required this.onPlay,
    required this.onPause,
    required this.onResume,
    required this.onRedownload,
    required this.onDelete,
  });

  final DownloadRecord record;
  final String? poster;
  final DateTime now;
  final VoidCallback onPlay;
  final VoidCallback onPause;
  final VoidCallback onResume;
  final VoidCallback onRedownload;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final r = record;
    final (String status, Color color) = switch (r.status) {
      DownloadStatus.downloading => (
        '${(r.fraction * 100).toStringAsFixed(0)}% · ${formatBytes(r.receivedBytes)} of ${formatBytes(r.totalBytes)}',
        AppColors.primary,
      ),
      DownloadStatus.paused => (
        'Paused · ${formatBytes(r.receivedBytes)} of ${formatBytes(r.totalBytes)}',
        AppColors.textMuted,
      ),
      DownloadStatus.failed => ('Failed. Check your connection and retry', AppColors.live),
      DownloadStatus.completed => (
        [
          formatBytes(r.receivedBytes),
          if (ExpiryPolicy.timeLeft(r, now) case final left?) formatTimeLeft(left),
          if (r.firstPlayedAt == null) 'Not started' else 'Watching',
        ].join(' · '),
        AppColors.teal,
      ),
      DownloadStatus.expired => ('Expired. Download again to keep watching offline', AppColors.gold),
    };

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          GestureDetector(
            onTap: r.isCompleted ? onPlay : null,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: SizedBox(
                width: 64,
                height: 96,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Artwork(poster),
                    if (r.isCompleted)
                      const ColoredBox(
                        color: Color(0x55000000),
                        child: Icon(Icons.play_circle_fill_rounded, color: Colors.white, size: 30),
                      ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(r.title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15)),
                const SizedBox(height: 2),
                Text('${r.quality} · offline copy', style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
                const SizedBox(height: 8),
                if (r.status == DownloadStatus.downloading || r.status == DownloadStatus.paused) ...[
                  ClipRRect(
                    borderRadius: BorderRadius.circular(2),
                    child: LinearProgressIndicator(
                      value: r.fraction == 0 ? null : r.fraction,
                      minHeight: 4,
                      backgroundColor: Colors.white12,
                    ),
                  ),
                  const SizedBox(height: 6),
                ],
                Text(
                  status,
                  style: TextStyle(color: color, fontSize: 12.5, fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ),
          switch (r.status) {
            DownloadStatus.downloading => IconButton(
              tooltip: 'Pause',
              onPressed: onPause,
              icon: const Icon(Icons.pause_rounded),
            ),
            DownloadStatus.paused || DownloadStatus.failed => IconButton(
              tooltip: 'Resume',
              onPressed: onResume,
              icon: const Icon(Icons.play_arrow_rounded),
            ),
            DownloadStatus.completed => IconButton(
              tooltip: 'Play offline',
              onPressed: onPlay,
              icon: const Icon(Icons.play_circle_outline_rounded),
            ),
            DownloadStatus.expired => IconButton(
              tooltip: 'Download again',
              onPressed: onRedownload,
              icon: const Icon(Icons.refresh_rounded),
            ),
          },
          IconButton(tooltip: 'Delete', onPressed: onDelete, icon: const Icon(Icons.delete_outline_rounded)),
        ],
      ),
    );
  }
}
