import '../../subscription/domain/plan.dart';
import 'age_rating.dart';

enum ContentKind { movie, documentary }

class StreamSource {
  const StreamSource({required this.url, required this.adaptive, this.note});

  final Uri url;

  /// True for HLS (several qualities, switches by bandwidth); false for a
  /// single progressive file.
  final bool adaptive;
  final String? note;

  factory StreamSource.fromJson(Map<String, dynamic> json) => StreamSource(
    url: Uri.parse(json['url'] as String),
    adaptive: json['adaptive'] as bool? ?? false,
    note: json['note'] as String?,
  );
}

class SubtitleTrack {
  const SubtitleTrack({required this.language, required this.label, required this.url});

  final String language;
  final String label;
  final Uri url;

  factory SubtitleTrack.fromJson(Map<String, dynamic> json) => SubtitleTrack(
    language: json['language'] as String,
    label: json['label'] as String,
    url: Uri.parse(json['url'] as String),
  );
}

class DownloadSource {
  const DownloadSource({required this.url, required this.label, required this.sizeMb});

  final Uri url;
  final String label;
  final int sizeMb;

  factory DownloadSource.fromJson(Map<String, dynamic> json) => DownloadSource(
    url: Uri.parse(json['url'] as String),
    label: json['label'] as String,
    sizeMb: json['sizeMb'] as int,
  );
}

class Credit {
  const Credit({required this.personId, required this.role, this.character});

  final String personId;
  final String role;
  final String? character;

  bool get isCast => role == 'Cast' || role == 'Voice';

  factory Credit.fromJson(Map<String, dynamic> json) => Credit(
    personId: json['personId'] as String,
    role: json['role'] as String,
    character: json['character'] as String?,
  );
}

class Person {
  const Person({required this.id, required this.name, required this.bio});

  final String id;
  final String name;
  final String bio;

  String get initials {
    final parts = name.split(' ').where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return '?';
    if (parts.length == 1) return parts.first[0].toUpperCase();
    return (parts.first[0] + parts.last[0]).toUpperCase();
  }
}

class Content {
  const Content({
    required this.id,
    required this.title,
    required this.tagline,
    required this.synopsis,
    required this.kind,
    required this.year,
    required this.runtime,
    required this.rating,
    required this.ratingReason,
    required this.genres,
    required this.tags,
    required this.audioLanguages,
    required this.minPlan,
    required this.featured,
    required this.popularity,
    required this.poster,
    required this.backdrop,
    required this.stream,
    required this.subtitles,
    required this.credits,
    required this.license,
    this.download,
  });

  final String id;
  final String title;
  final String tagline;
  final String synopsis;
  final ContentKind kind;
  final int? year;
  final Duration runtime;
  final AgeRating rating;
  final String ratingReason;
  final List<String> genres;
  final List<String> tags;
  final List<String> audioLanguages;
  final Plan minPlan;
  final bool featured;
  final int popularity;
  final String poster;
  final String backdrop;
  final StreamSource stream;
  final List<SubtitleTrack> subtitles;
  final DownloadSource? download;
  final List<Credit> credits;
  final String license;

  factory Content.fromJson(Map<String, dynamic> json) => Content(
    id: json['id'] as String,
    title: json['title'] as String,
    tagline: json['tagline'] as String,
    synopsis: json['synopsis'] as String,
    kind: ContentKind.values.byName(json['kind'] as String),
    year: json['year'] as int?,
    runtime: Duration(seconds: json['runtimeSeconds'] as int),
    rating: AgeRating.parse(json['rating'] as String),
    ratingReason: json['ratingReason'] as String,
    genres: List<String>.from(json['genres'] as List),
    tags: List<String>.from(json['tags'] as List),
    audioLanguages: List<String>.from(json['audioLanguages'] as List),
    minPlan: Plan.parse(json['minPlan'] as String),
    featured: json['featured'] as bool? ?? false,
    popularity: json['popularity'] as int? ?? 0,
    poster: json['poster'] as String,
    backdrop: json['backdrop'] as String,
    stream: StreamSource.fromJson(json['stream'] as Map<String, dynamic>),
    subtitles: [for (final s in json['subtitles'] as List) SubtitleTrack.fromJson(s as Map<String, dynamic>)],
    download: json['download'] == null ? null : DownloadSource.fromJson(json['download'] as Map<String, dynamic>),
    credits: [for (final c in json['credits'] as List) Credit.fromJson(c as Map<String, dynamic>)],
    license: json['license'] as String,
  );
}

enum LiveKind { live, watchParty, studio }

class LiveChannel {
  const LiveChannel({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.kind,
    required this.url,
    required this.rating,
    required this.minPlan,
    required this.credit,
    this.backdrop,
    this.loop,
  });

  final String id;
  final String title;
  final String subtitle;
  final LiveKind kind;
  final Uri url;
  final AgeRating rating;
  final Plan minPlan;
  final String credit;
  final String? backdrop;

  /// Watch parties replay one video on a loop; this is its length.
  final Duration? loop;

  factory LiveChannel.fromJson(Map<String, dynamic> json) => LiveChannel(
    id: json['id'] as String,
    title: json['title'] as String,
    subtitle: json['subtitle'] as String,
    kind: LiveKind.values.byName(json['kind'] as String),
    url: Uri.parse(json['url'] as String),
    rating: AgeRating.parse(json['rating'] as String),
    minPlan: Plan.parse(json['minPlan'] as String),
    credit: json['credit'] as String,
    backdrop: json['backdrop'] as String?,
    loop: json['loopSeconds'] == null ? null : Duration(seconds: json['loopSeconds'] as int),
  );
}

class Rail {
  const Rail({required this.title, required this.items});

  final String title;
  final List<Content> items;
}

/// Everything the app knows about what can be watched.
class Catalog {
  const Catalog({required this.titles, required this.live, required this.rails, required this.people});

  final List<Content> titles;
  final List<LiveChannel> live;
  final List<Rail> rails;
  final Map<String, Person> people;

  Content? byId(String id) => titles.where((t) => t.id == id).firstOrNull;

  LiveChannel? liveById(String id) => live.where((l) => l.id == id).firstOrNull;

  List<Content> get featured => titles.where((t) => t.featured).toList();

  /// Titles a person worked on, with their roles in each.
  List<(Content, List<Credit>)> filmography(String personId) => [
    for (final t in titles)
      if (t.credits.any((c) => c.personId == personId)) (t, t.credits.where((c) => c.personId == personId).toList()),
  ];

  factory Catalog.fromJson(Map<String, dynamic> json, {List<LiveChannel> extraLive = const []}) {
    final titles = [for (final t in json['titles'] as List) Content.fromJson(t as Map<String, dynamic>)];
    final byId = {for (final t in titles) t.id: t};
    final people = <String, Person>{
      for (final e in (json['people'] as Map<String, dynamic>).entries)
        e.key: Person(
          id: e.key,
          name: (e.value as Map<String, dynamic>)['name'] as String,
          bio: (e.value as Map<String, dynamic>)['bio'] as String,
        ),
    };
    return Catalog(
      titles: titles,
      live: [for (final l in json['live'] as List) LiveChannel.fromJson(l as Map<String, dynamic>), ...extraLive],
      rails: [
        for (final r in json['rails'] as List)
          Rail(
            title: (r as Map<String, dynamic>)['title'] as String,
            items: [for (final id in r['ids'] as List) ?byId[id]],
          ),
      ],
      people: people,
    );
  }
}
