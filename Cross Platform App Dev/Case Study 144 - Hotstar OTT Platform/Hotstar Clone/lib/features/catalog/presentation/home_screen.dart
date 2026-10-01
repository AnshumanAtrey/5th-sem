import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/badges.dart';
import '../../../core/widgets/brand.dart';
import '../../../core/widgets/content_cards.dart';
import '../../account/data/account_repository.dart';
import '../../auth/data/auth_repository.dart';
import '../../parental/application/parental_gate.dart';
import '../../progress/data/progress_repository.dart';
import '../../subscription/domain/plan.dart';
import '../application/title_actions.dart';
import '../data/catalog_repository.dart';
import '../domain/content.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catalog = ref.watch(catalogProvider);
    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const BrandMark(),
        flexibleSpace: const DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xCC07090F), Colors.transparent],
            ),
          ),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: TierBadge(ref.watch(effectivePlanProvider), onTap: () => context.push('/plans')),
          ),
        ],
      ),
      body: catalog.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ErrorView(error: e, onRetry: () => ref.invalidate(catalogProvider)),
        data: (c) => _HomeBody(catalog: c),
      ),
    );
  }
}

class _HomeBody extends ConsumerWidget {
  const _HomeBody({required this.catalog});

  final Catalog catalog;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final progress = ref.watch(recentProgressProvider).value ?? const [];
    final continueWatching = [
      for (final p in progress)
        if (p.isResumable)
          if (catalog.byId(p.contentId) case final content?) (content, p),
    ];

    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(child: _HeroCarousel(items: catalog.featured)),
        if (continueWatching.isNotEmpty) ...[
          const SliverToBoxAdapter(child: SectionHeader('Continue watching')),
          SliverToBoxAdapter(
            child: HorizontalRail(
              height: 196,
              itemCount: continueWatching.length,
              itemBuilder: (context, i) {
                final (content, p) = continueWatching[i];
                return LandscapeCard(
                  image: content.backdrop,
                  title: content.title,
                  subtitle: '${formatRuntime(p.remaining)} left',
                  progress: p.fraction,
                  onTap: () => playTitle(context, ref, content),
                  trailing: IconButton(
                    tooltip: 'Remove from Continue watching',
                    visualDensity: VisualDensity.compact,
                    icon: const Icon(Icons.close_rounded, size: 18, color: AppColors.textMuted),
                    onPressed: () {
                      final uid = ref.read(currentUserProvider)?.uid;
                      if (uid != null) ref.read(progressRepositoryProvider).remove(uid, content.id);
                    },
                  ),
                );
              },
            ),
          ),
        ],
        if (catalog.live.isNotEmpty) ...[
          SliverToBoxAdapter(
            child: SectionHeader(
              'Live now',
              action: TextButton(onPressed: () => context.go('/live'), child: const Text('See all')),
            ),
          ),
          SliverToBoxAdapter(
            child: HorizontalRail(
              height: 196,
              itemCount: catalog.live.length,
              itemBuilder: (context, i) {
                final ch = catalog.live[i];
                return LandscapeCard(
                  width: 250,
                  image: ch.backdrop,
                  title: ch.title,
                  subtitle: ch.subtitle,
                  badge: LiveBadge(label: ch.kind == LiveKind.watchParty ? 'WATCH PARTY' : 'LIVE'),
                  onTap: () => joinLive(context, ref, ch),
                );
              },
            ),
          ),
        ],
        for (final rail in catalog.rails) ...[
          SliverToBoxAdapter(child: SectionHeader(rail.title)),
          SliverToBoxAdapter(child: PosterRail(items: rail.items)),
        ],
        const SliverToBoxAdapter(child: SizedBox(height: 32)),
      ],
    );
  }
}

/// A row of posters that respects parental locks.
class PosterRail extends ConsumerWidget {
  const PosterRail({super.key, required this.items});

  final List<Content> items;

  @override
  Widget build(BuildContext context, WidgetRef ref) => HorizontalRail(
    height: 186,
    itemCount: items.length,
    itemBuilder: (context, i) {
      final c = items[i];
      return PosterCard(
        content: c,
        locked: ref.watch(isParentalLockedProvider((c.id, c.rating))),
        onTap: () => openTitle(context, ref, c),
      );
    },
  );
}

class _HeroCarousel extends ConsumerStatefulWidget {
  const _HeroCarousel({required this.items});

  final List<Content> items;

  @override
  ConsumerState<_HeroCarousel> createState() => _HeroCarouselState();
}

class _HeroCarouselState extends ConsumerState<_HeroCarousel> {
  final _controller = PageController();
  Timer? _timer;
  int _page = 0;

  @override
  void initState() {
    super.initState();
    _restartTimer();
  }

  void _restartTimer() {
    _timer?.cancel();
    if (widget.items.length < 2) return;
    _timer = Timer.periodic(const Duration(seconds: 6), (_) {
      if (!_controller.hasClients) return;
      final next = (_page + 1) % widget.items.length;
      _controller.animateToPage(next, duration: const Duration(milliseconds: 600), curve: Curves.easeOutCubic);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.items.isEmpty) return const SizedBox(height: 100);
    final size = MediaQuery.sizeOf(context);
    final height = (size.width >= 840 ? size.height * 0.62 : size.width * 1.15).clamp(380.0, 620.0);

    return SizedBox(
      height: height,
      child: Stack(
        children: [
          NotificationListener<ScrollStartNotification>(
            // The user is swiping, so hold off the auto-advance.
            onNotification: (n) {
              if (n.dragDetails != null) _restartTimer();
              return false;
            },
            child: PageView.builder(
              controller: _controller,
              itemCount: widget.items.length,
              onPageChanged: (i) => setState(() => _page = i),
              itemBuilder: (context, i) => _HeroPage(content: widget.items[i]),
            ),
          ),
          Positioned(
            right: 16,
            bottom: 20,
            child: Row(
              children: [
                for (var i = 0; i < widget.items.length; i++)
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    margin: const EdgeInsets.only(left: 5),
                    width: i == _page ? 18 : 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: i == _page ? Colors.white : Colors.white38,
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroPage extends ConsumerWidget {
  const _HeroPage({required this.content});

  final Content content;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final text = Theme.of(context).textTheme;
    final progress = ref.watch(progressForProvider(content.id));
    final resumable = progress?.isResumable ?? false;

    return Stack(
      fit: StackFit.expand,
      children: [
        Artwork(content.backdrop),
        const DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              stops: [0.35, 0.78, 1],
              colors: [Colors.transparent, Color(0xCC07090F), AppColors.background],
            ),
          ),
        ),
        const DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              stops: [0, 0.6],
              colors: [Color(0x9907090F), Colors.transparent],
            ),
          ),
        ),
        Positioned(
          left: 16,
          right: 16,
          bottom: 44,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (content.minPlan != Plan.free) ...[TierBadge(content.minPlan), const SizedBox(height: 10)],
              Text(content.title, style: text.displaySmall?.copyWith(fontSize: 36, height: 1.05)),
              const SizedBox(height: 6),
              Text(
                content.tagline,
                maxLines: 2,
                style: text.titleSmall?.copyWith(color: Colors.white70, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 10),
              MetaLine(content),
              const SizedBox(height: 16),
              Row(
                children: [
                  FilledButton.icon(
                    onPressed: () => playTitle(context, ref, content),
                    icon: const Icon(Icons.play_arrow_rounded),
                    label: Text(resumable ? 'Resume' : 'Watch now'),
                  ),
                  const SizedBox(width: 10),
                  IconButton.filledTonal(
                    tooltip: 'Details',
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.white.withValues(alpha: 0.14),
                      minimumSize: const Size(48, 48),
                    ),
                    onPressed: () => openTitle(context, ref, content),
                    icon: const Icon(Icons.info_outline_rounded, color: Colors.white),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
