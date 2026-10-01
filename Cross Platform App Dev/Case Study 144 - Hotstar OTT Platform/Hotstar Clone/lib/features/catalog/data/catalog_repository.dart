import 'dart:convert';

import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/config/env.dart';
import '../../subscription/domain/plan.dart';
import '../domain/age_rating.dart';
import '../domain/content.dart';

/// The catalogue ships with the app as JSON. The rest of the app only sees
/// this class, so moving the catalogue to Firestore or a REST API later
/// changes this one file.
class CatalogRepository {
  CatalogRepository(this._bundle);

  final AssetBundle _bundle;

  Future<Catalog> load() async {
    final raw = await _bundle.loadString('assets/data/catalog.json');
    return Catalog.fromJson(
      jsonDecode(raw) as Map<String, dynamic>,
      extraLive: [
        if (Env.studioLiveUrl.isNotEmpty)
          LiveChannel(
            id: 'studio',
            title: 'Hotstar Clone Studio',
            subtitle: 'Broadcast from your own laptop via OBS + MediaMTX',
            kind: LiveKind.studio,
            url: Uri.parse(Env.studioLiveUrl),
            rating: AgeRating.u,
            minPlan: Plan.free,
            credit: 'Your own RTMP → HLS stream',
          ),
      ],
    );
  }
}

final catalogRepositoryProvider = Provider((ref) => CatalogRepository(rootBundle));

final catalogProvider = FutureProvider<Catalog>((ref) => ref.watch(catalogRepositoryProvider).load());
