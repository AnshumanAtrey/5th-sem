import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/badges.dart';
import '../../../core/widgets/content_cards.dart';
import '../../account/data/account_repository.dart';
import '../../auth/data/auth_repository.dart';
import '../../downloads/presentation/download_button.dart';
import '../../progress/data/progress_repository.dart';
import '../../reviews/presentation/reviews_section.dart';
import '../../subscription/domain/plan.dart';
import '../application/title_actions.dart';
import '../data/catalog_repository.dart';
import '../domain/content.dart';
import '../domain/recommender.dart';
import 'home_screen.dart';

class DetailScreen extends ConsumerWidget {
  const DetailScreen({super.key, required this.contentId});

  final String contentId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catalog = ref.watch(catalogProvider);
    return Scaffold(
      body: catalog.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ErrorView(error: e, onRetry: () => ref.invalidate(catalogProvider)),
        data: (c) {
          final content = c.byId(contentId);
          if (content == null) {
            return const EmptyState(
              icon: Icons.search_off_rounded,
              title: 'Title not found',
              message: 'It may have been removed from the catalogue.',
            );
          }
          return _DetailBody(content: content, catalog: c);
        },
      ),
    );
  }
}

class _DetailBody extends ConsumerStatefulWidget {
  const _DetailBody({required this.content, required this.catalog});

  final Content content;
  final Catalog catalog;

  @override
  ConsumerState<_DetailBody> createState() => _DetailBodyState();
}

class _DetailBodyState extends ConsumerState<_DetailBody> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final content = widget.content;
    final text = Theme.of(context).textTheme;
    final plan = ref.watch(effectivePlanProvider);
    final unlocked = plan.includes(content.minPlan);
    final progress = ref.watch(progressForProvider(content.id));
    final resumable = progress?.isResumable ?? false;
    final similar = similarTo(content, widget.catalog.titles);
    final width = MediaQuery.sizeOf(context).width;

    return CustomScrollView(
      slivers: [
        SliverAppBar(
          pinned: true,
          stretch: true,
          expandedHeight: (width * 9 / 16).clamp(220.0, 460.0),
          backgroundColor: AppColors.background,
          leading: const _CircleBack(),
          flexibleSpace: FlexibleSpaceBar(
            stretchModes: const [StretchMode.zoomBackground],
            background: Stack(
              fit: StackFit.expand,
              children: [
                Artwork(content.backdrop),
                const DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      stops: [0, 0.3, 0.75, 1],
                      colors: [Color(0x8007090F), Colors.transparent, Color(0x9907090F), AppColors.background],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (content.minPlan != Plan.free) ...[
                  TierBadge(content.minPlan, large: true, onTap: () => context.push('/plans')),
                  const SizedBox(height: 10),
                ],
                Text(content.title, style: text.headlineMedium),
                const SizedBox(height: 6),
                MetaLine(content, showGenres: false, showRating: false),
                const SizedBox(height: 10),
                _RatingRow(content: content),
                const SizedBox(height: 18),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: () => playTitle(context, ref, content),
                    icon: Icon(unlocked ? Icons.play_arrow_rounded : Icons.lock_outline_rounded),
                    label: Text(
                      !unlocked
                          ? 'Get ${content.minPlan.label} to watch'
                          : resumable
                          ? 'Resume from ${formatClock(progress!.position)}'
                          : 'Watch now',
                    ),
                  ),
                ),
                if (resumable) ...[
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(2),
                    child: LinearProgressIndicator(
                      value: progress!.fraction,
                      minHeight: 3,
                      backgroundColor: Colors.white12,
                    ),
                  ),
                ],
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(child: DownloadButton(content: content)),
                    if (resumable) ...[
                      const SizedBox(width: 10),
                      OutlinedButton.icon(
                        onPressed: () async {
                          final uid = ref.read(currentUserProvider)?.uid;
                          if (uid == null) return;
                          await ref.read(progressRepositoryProvider).remove(uid, content.id);
                          if (context.mounted) await playTitle(context, ref, content);
                        },
                        icon: const Icon(Icons.replay_rounded, size: 20),
                        label: const Text('Start over'),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 18),
                _StreamFacts(content: content, plan: plan),
                const SizedBox(height: 16),
                GestureDetector(
                  onTap: () => setState(() => _expanded = !_expanded),
                  child: AnimatedSize(
                    duration: const Duration(milliseconds: 200),
                    alignment: Alignment.topCenter,
                    child: Text(
                      content.synopsis,
                      maxLines: _expanded ? null : 3,
                      overflow: _expanded ? null : TextOverflow.ellipsis,
                      style: text.bodyMedium?.copyWith(color: Colors.white.withValues(alpha: 0.85)),
                    ),
                  ),
                ),
                if (!_expanded)
                  TextButton(
                    style: TextButton.styleFrom(
                      padding: EdgeInsets.zero,
                      minimumSize: const Size(0, 36),
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    onPressed: () => setState(() => _expanded = true),
                    child: const Text('More'),
                  ),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final g in content.genres) Chip(label: Text(g), visualDensity: VisualDensity.compact),
                  ],
                ),
              ],
            ),
          ),
        ),
        if (content.credits.isNotEmpty) ...[
          const SliverToBoxAdapter(child: SectionHeader('Cast & crew')),
          SliverToBoxAdapter(
            child: _CreditsRail(content: content, people: widget.catalog.people),
          ),
        ],
        const SliverToBoxAdapter(child: SectionHeader('Ratings & reviews')),
        SliverToBoxAdapter(
          child: ReviewsSection(contentId: content.id, title: content.title),
        ),
        if (similar.isNotEmpty) ...[
          const SliverToBoxAdapter(child: SectionHeader('More like this')),
          SliverToBoxAdapter(child: PosterRail(items: similar)),
        ],
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 24, 16, 40),
            child: Text(content.license, style: text.bodySmall),
          ),
        ),
      ],
    );
  }
}

class _CircleBack extends StatelessWidget {
  const _CircleBack();

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.all(8),
    child: IconButton.filled(
      style: IconButton.styleFrom(backgroundColor: const Color(0x66000000)),
      tooltip: 'Back',
      icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
      onPressed: () => context.canPop() ? context.pop() : context.go('/'),
    ),
  );
}

class _RatingRow extends StatelessWidget {
  const _RatingRow({required this.content});

  final Content content;

  @override
  Widget build(BuildContext context) => Row(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      AgeRatingBadge(content.rating),
      const SizedBox(width: 10),
      Expanded(
        child: Text(
          '${content.ratingReason}. ${content.rating.description}.',
          style: const TextStyle(color: AppColors.textMuted, fontSize: 12.5),
        ),
      ),
    ],
  );
}

/// Quality, audio and subtitle facts, as the player will deliver them.
class _StreamFacts extends StatelessWidget {
  const _StreamFacts({required this.content, required this.plan});

  final Content content;
  final Plan plan;

  @override
  Widget build(BuildContext context) {
    Widget fact(IconData icon, String label, String value) => Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: AppColors.textMuted),
          const SizedBox(width: 10),
          SizedBox(
            width: 78,
            child: Text(
              label,
              style: const TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.w600),
            ),
          ),
          Expanded(
            child: Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(14)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          fact(
            Icons.high_quality_rounded,
            'Quality',
            content.stream.adaptive
                ? 'Adaptive HLS · up to ${plan.qualityLabel} on ${plan.label}'
                : 'Single file (not adaptive)',
          ),
          fact(Icons.record_voice_over_outlined, 'Audio', content.audioLanguages.join(', ')),
          fact(
            Icons.closed_caption_outlined,
            'Subtitles',
            content.subtitles.isEmpty ? 'None' : content.subtitles.map((s) => s.label).join(', '),
          ),
          if (content.stream.note != null) ...[
            const SizedBox(height: 6),
            Text(content.stream.note!, style: Theme.of(context).textTheme.bodySmall),
          ],
        ],
      ),
    );
  }
}

class _CreditsRail extends StatelessWidget {
  const _CreditsRail({required this.content, required this.people});

  final Content content;
  final Map<String, Person> people;

  @override
  Widget build(BuildContext context) {
    // One card per person, even if they have several roles (director and writer).
    final byPerson = <String, List<Credit>>{};
    for (final c in content.credits) {
      byPerson.putIfAbsent(c.personId, () => []).add(c);
    }
    final entries = byPerson.entries.where((e) => people.containsKey(e.key)).toList();

    return HorizontalRail(
      height: 132,
      itemCount: entries.length,
      itemBuilder: (context, i) {
        final person = people[entries[i].key]!;
        final roles = entries[i].value;
        final subtitle = roles.map((r) => r.character != null ? '${r.character} (voice)' : r.role).join(' · ');
        return SizedBox(
          width: 92,
          child: InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: () => context.push('/person/${person.id}'),
            child: Column(
              children: [
                PersonAvatar(person: person, radius: 34),
                const SizedBox(height: 8),
                Text(
                  person.name,
                  maxLines: 2,
                  textAlign: TextAlign.center,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5, height: 1.2),
                ),
                Text(
                  subtitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

/// Initials on a gradient picked from the name. We have no headshots, and
/// won't invent photos of real people.
class PersonAvatar extends StatelessWidget {
  const PersonAvatar({super.key, required this.person, this.radius = 30});

  final Person person;
  final double radius;

  static const _palettes = [
    [Color(0xFF5B8CFF), Color(0xFF3B5BDB)],
    [Color(0xFFA855F7), Color(0xFF6D28D9)],
    [Color(0xFF14B8A6), Color(0xFF0E7490)],
    [Color(0xFFF59E0B), Color(0xFFB45309)],
    [Color(0xFFEC4899), Color(0xFFBE185D)],
  ];

  @override
  Widget build(BuildContext context) {
    final colors = _palettes[person.name.codeUnits.fold(0, (a, b) => a + b) % _palettes.length];
    return Container(
      width: radius * 2,
      height: radius * 2,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(colors: colors),
      ),
      alignment: Alignment.center,
      child: Text(
        person.initials,
        style: TextStyle(fontSize: radius * 0.62, fontWeight: FontWeight.w800, color: Colors.white),
      ),
    );
  }
}
