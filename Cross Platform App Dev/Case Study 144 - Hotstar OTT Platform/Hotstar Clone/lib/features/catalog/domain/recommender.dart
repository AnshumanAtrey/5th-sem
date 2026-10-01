import 'content.dart';

/// "More like this", computed on the device. It scores every other title by
/// shared genres (Jaccard similarity), shared tags and shared crew, then
/// breaks ties by popularity.
List<Content> similarTo(Content seed, List<Content> all, {int limit = 10}) {
  double jaccard(Set<String> a, Set<String> b) {
    if (a.isEmpty && b.isEmpty) return 0;
    return a.intersection(b).length / a.union(b).length;
  }

  final seedGenres = seed.genres.toSet();
  final seedTags = seed.tags.toSet();
  final seedPeople = seed.credits.map((c) => c.personId).toSet();

  final scored =
      <(Content, double)>[
        for (final c in all)
          if (c.id != seed.id)
            (
              c,
              3 * jaccard(seedGenres, c.genres.toSet()) +
                  1.5 * jaccard(seedTags, c.tags.toSet()) +
                  0.5 * seedPeople.intersection(c.credits.map((x) => x.personId).toSet()).length +
                  (c.kind == seed.kind ? 0.25 : 0),
            ),
      ]..sort((a, b) {
        final byScore = b.$2.compareTo(a.$2);
        return byScore != 0 ? byScore : b.$1.popularity.compareTo(a.$1.popularity);
      });

  return [for (final (c, _) in scored.take(limit)) c];
}
