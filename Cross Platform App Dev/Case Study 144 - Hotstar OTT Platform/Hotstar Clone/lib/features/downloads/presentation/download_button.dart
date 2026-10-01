import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../account/data/account_repository.dart';
import '../../catalog/domain/content.dart';
import '../../subscription/domain/access_policy.dart';
import '../../subscription/domain/plan.dart';
import '../../subscription/presentation/upgrade_sheet.dart';
import '../data/downloads_controller.dart';
import '../domain/download_record.dart';

/// One button covering every download state: available, locked,
/// downloading, paused, done, expired.
class DownloadButton extends ConsumerWidget {
  const DownloadButton({super.key, required this.content});

  final Content content;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final source = content.download;
    if (source == null) {
      return const _Action(icon: Icons.cloud_off_rounded, label: 'Streaming only', onTap: null);
    }

    final record = ref.watch(downloadsProvider.select((m) => m[content.id]));
    final controller = ref.read(downloadsProvider.notifier);
    final plan = ref.watch(effectivePlanProvider);

    if (record == null) {
      if (!AccessPolicy.canDownload(plan: plan, required: content.minPlan)) {
        final needed = plan.allowsDownloads ? content.minPlan : Plan.mobile;
        return _Action(
          icon: Icons.lock_outline_rounded,
          label: 'Download',
          onTap: () => showUpgradeSheet(context, required: needed, reason: 'Downloads need ${needed.label} or higher'),
        );
      }
      return _Action(
        icon: Icons.download_rounded,
        label: 'Download ${source.label} · ${source.sizeMb} MB',
        onTap: () => controller.start(content),
      );
    }

    return switch (record.status) {
      DownloadStatus.downloading => _Action(
        progress: record.fraction,
        label: '${(record.fraction * 100).toStringAsFixed(0)}% · Pause',
        onTap: () => controller.pause(content.id),
      ),
      DownloadStatus.paused => _Action(
        icon: Icons.play_circle_outline_rounded,
        label: 'Paused ${(record.fraction * 100).toStringAsFixed(0)}% · Resume',
        onTap: () => controller.resume(content.id, source.url),
      ),
      DownloadStatus.failed => _Action(
        icon: Icons.refresh_rounded,
        label: 'Failed · Retry',
        color: AppColors.live,
        onTap: () => controller.resume(content.id, source.url),
      ),
      DownloadStatus.completed => _Action(
        icon: Icons.download_done_rounded,
        label: switch (ExpiryPolicy.timeLeft(record, controller.now())) {
          final left? => 'Saved · ${formatTimeLeftShort(left)}',
          null => 'Downloaded',
        },
        color: AppColors.teal,
        onTap: () => context.go('/downloads'),
      ),
      DownloadStatus.expired => _Action(
        icon: Icons.history_rounded,
        label: 'Expired · Download again',
        color: AppColors.gold,
        onTap: () => controller.start(content),
      ),
    };
  }
}

class _Action extends StatelessWidget {
  const _Action({required this.label, required this.onTap, this.icon, this.progress, this.color});

  final String label;
  final VoidCallback? onTap;
  final IconData? icon;
  final double? progress;
  final Color? color;

  @override
  Widget build(BuildContext context) => OutlinedButton(
    onPressed: onTap,
    style: OutlinedButton.styleFrom(foregroundColor: color ?? Colors.white),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (progress != null)
          SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(value: progress == 0 ? null : progress, strokeWidth: 2.4),
          )
        else if (icon != null)
          Icon(icon, size: 20),
        const SizedBox(width: 8),
        Flexible(child: Text(label, overflow: TextOverflow.ellipsis)),
      ],
    ),
  );
}
