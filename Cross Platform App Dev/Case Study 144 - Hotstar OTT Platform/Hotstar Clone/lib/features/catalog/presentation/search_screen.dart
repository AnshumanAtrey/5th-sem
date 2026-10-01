import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/widgets/content_cards.dart';
import '../../parental/application/parental_gate.dart';
import '../application/title_actions.dart';
import '../data/catalog_repository.dart';
import '../domain/content.dart';

/// Matches the title, genres, tags and cast/crew names, case-insensitively.
List<Content> searchCatalog(Catalog catalog, String query, {String? genre}) {
  final q = query.trim().toLowerCase();
  return catalog.titles.where((t) {
    if (genre != null && !t.genres.contains(genre)) return false;
    if (q.isEmpty) return true;
    final haystack = [
      t.title,
      ...t.genres,
      ...t.tags,
      for (final c in t.credits) catalog.people[c.personId]?.name ?? '',
    ].join(' ').toLowerCase();
    return q.split(RegExp(r'\s+')).every(haystack.contains);
  }).toList()..sort((a, b) => b.popularity.compareTo(a.popularity));
}

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _query = TextEditingController();
  String? _genre;

  @override
  void dispose() {
    _query.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final catalog = ref.watch(catalogProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Search')),
      body: catalog.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ErrorView(error: e, onRetry: () => ref.invalidate(catalogProvider)),
        data: (c) {
          final genres = {for (final t in c.titles) ...t.genres}.toList()..sort();
          final results = searchCatalog(c, _query.text, genre: _genre);
          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
                child: TextField(
                  controller: _query,
                  textInputAction: TextInputAction.search,
                  onChanged: (_) => setState(() {}),
                  decoration: InputDecoration(
                    hintText: 'Titles, genres, cast…',
                    prefixIcon: const Icon(Icons.search_rounded),
                    suffixIcon: _query.text.isEmpty
                        ? null
                        : IconButton(
                            tooltip: 'Clear',
                            icon: const Icon(Icons.close_rounded),
                            onPressed: () => setState(_query.clear),
                          ),
                  ),
                ),
              ),
              SizedBox(
                height: 44,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: [
                    for (final g in genres)
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChip(
                          label: Text(g),
                          selected: _genre == g,
                          onSelected: (on) => setState(() => _genre = on ? g : null),
                        ),
                      ),
                  ],
                ),
              ),
              Expanded(
                child: results.isEmpty
                    ? const EmptyState(
                        icon: Icons.search_off_rounded,
                        title: 'No matches',
                        message: 'Try a different word or clear the genre filter.',
                      )
                    : LayoutBuilder(
                        builder: (context, constraints) {
                          final columns = (constraints.maxWidth / 140).floor().clamp(2, 8);
                          return GridView.builder(
                            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: columns,
                              childAspectRatio: 2 / 3,
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                            ),
                            itemCount: results.length,
                            itemBuilder: (context, i) {
                              final t = results[i];
                              return PosterCard(
                                content: t,
                                width: double.infinity,
                                locked: ref.watch(isParentalLockedProvider((t.id, t.rating))),
                                onTap: () => openTitle(context, ref, t),
                              );
                            },
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}
