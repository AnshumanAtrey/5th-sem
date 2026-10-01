import 'package:flutter/material.dart';

import '../../features/catalog/domain/content.dart';
import '../../features/subscription/domain/plan.dart';
import '../theme/app_theme.dart';
import '../utils/formatters.dart';
import 'badges.dart';

/// Artwork with a fallback, so a missing file never shows a red error box.
class Artwork extends StatelessWidget {
  const Artwork(this.asset, {super.key, this.fit = BoxFit.cover, this.alignment = Alignment.center});

  final String? asset;
  final BoxFit fit;
  final Alignment alignment;

  @override
  Widget build(BuildContext context) {
    const fallback = DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1C2540), Color(0xFF0B0F1A)],
        ),
      ),
      child: Center(child: Icon(Icons.movie_filter_rounded, color: Colors.white24, size: 36)),
    );
    if (asset == null) return fallback;
    return Image.asset(asset!, fit: fit, alignment: alignment, errorBuilder: (_, _, _) => fallback);
  }
}

/// "2012 · 12m · Sci-Fi"
class MetaLine extends StatelessWidget {
  const MetaLine(this.content, {super.key, this.showGenres = true, this.showRating = true, this.style});

  final Content content;
  final bool showGenres;
  final bool showRating;
  final TextStyle? style;

  @override
  Widget build(BuildContext context) {
    final parts = [
      if (content.year != null) '${content.year}',
      formatRuntime(content.runtime),
      if (showGenres) ...content.genres.take(2),
    ];
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Flexible(
          child: Text(
            parts.join('  ·  '),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: style ?? const TextStyle(color: AppColors.textMuted, fontSize: 13, fontWeight: FontWeight.w600),
          ),
        ),
        if (showRating) ...[const SizedBox(width: 8), AgeRatingBadge(content.rating, compact: true)],
      ],
    );
  }
}

class PosterCard extends StatelessWidget {
  const PosterCard({super.key, required this.content, required this.onTap, this.width = 124, this.locked = false});

  final Content content;
  final VoidCallback onTap;
  final double width;

  /// Blocked by parental controls: shows a lock.
  final bool locked;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      child: Semantics(
        button: true,
        label: '${content.title}, ${content.rating.label}${locked ? ', locked by parental controls' : ''}',
        child: AspectRatio(
          aspectRatio: 2 / 3,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: Stack(
              fit: StackFit.expand,
              children: [
                Artwork(content.poster),
                const DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      stops: [0.55, 1],
                      colors: [Colors.transparent, Color(0xE6000000)],
                    ),
                  ),
                ),
                if (content.minPlan != Plan.free) Positioned(top: 6, left: 6, child: TierBadge(content.minPlan)),
                Positioned(
                  left: 8,
                  right: 8,
                  bottom: 8,
                  child: Text(
                    content.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, height: 1.15),
                  ),
                ),
                if (locked)
                  const ColoredBox(
                    color: Color(0x99000000),
                    child: Center(child: Icon(Icons.lock_rounded, color: Colors.white, size: 28)),
                  ),
                Material(
                  type: MaterialType.transparency,
                  child: InkWell(onTap: onTap),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// 16:9 card with an optional progress bar (Continue Watching, Live).
class LandscapeCard extends StatelessWidget {
  const LandscapeCard({
    super.key,
    required this.image,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.progress,
    this.badge,
    this.width = 240,
    this.trailing,
  });

  final String? image;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final double? progress;
  final Widget? badge;
  final double width;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: width,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 16 / 9,
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Artwork(image),
                    if (progress != null)
                      const DecoratedBox(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            stops: [0.6, 1],
                            colors: [Colors.transparent, Color(0xB3000000)],
                          ),
                        ),
                      ),
                    if (progress != null)
                      const Center(
                        child: CircleAvatar(
                          radius: 20,
                          backgroundColor: Color(0x99000000),
                          child: Icon(Icons.play_arrow_rounded, color: Colors.white, size: 26),
                        ),
                      ),
                    if (badge != null) Positioned(top: 8, left: 8, child: badge!),
                    if (progress != null)
                      Align(
                        alignment: Alignment.bottomCenter,
                        child: LinearProgressIndicator(
                          value: progress,
                          minHeight: 3,
                          backgroundColor: Colors.white24,
                          color: AppColors.primary,
                        ),
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        subtitle,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                      ),
                    ],
                  ),
                ),
                ?trailing,
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class SectionHeader extends StatelessWidget {
  const SectionHeader(this.title, {super.key, this.action});

  final String title;
  final Widget? action;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 20, 8, 10),
    child: Row(
      children: [
        Expanded(child: Text(title, style: Theme.of(context).textTheme.titleMedium)),
        ?action,
      ],
    ),
  );
}

/// A horizontally scrolling row of cards.
class HorizontalRail extends StatelessWidget {
  const HorizontalRail({super.key, required this.height, required this.itemCount, required this.itemBuilder});

  final double height;
  final int itemCount;
  final IndexedWidgetBuilder itemBuilder;

  @override
  Widget build(BuildContext context) => SizedBox(
    height: height,
    child: ListView.separated(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      itemCount: itemCount,
      separatorBuilder: (_, _) => const SizedBox(width: 12),
      itemBuilder: itemBuilder,
    ),
  );
}

class EmptyState extends StatelessWidget {
  const EmptyState({super.key, required this.icon, required this.title, required this.message, this.action});

  final IconData icon;
  final String title;
  final String message;
  final Widget? action;

  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: const BoxDecoration(color: AppColors.surfaceHigh, shape: BoxShape.circle),
            child: Icon(icon, size: 34, color: AppColors.textMuted),
          ),
          const SizedBox(height: 16),
          Text(title, style: Theme.of(context).textTheme.titleMedium, textAlign: TextAlign.center),
          const SizedBox(height: 6),
          Text(
            message,
            style: const TextStyle(color: AppColors.textMuted),
            textAlign: TextAlign.center,
          ),
          if (action != null) ...[const SizedBox(height: 18), action!],
        ],
      ),
    ),
  );
}

class ErrorView extends StatelessWidget {
  const ErrorView({super.key, required this.error, this.onRetry});

  final Object error;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) => EmptyState(
    icon: Icons.cloud_off_rounded,
    title: 'Something went wrong',
    message: '$error',
    action: onRetry == null ? null : OutlinedButton(onPressed: onRetry, child: const Text('Try again')),
  );
}
