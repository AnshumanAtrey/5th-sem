import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/widgets/content_cards.dart';
import '../application/title_actions.dart';
import '../data/catalog_repository.dart';
import 'detail_screen.dart';

class PersonScreen extends ConsumerWidget {
  const PersonScreen({super.key, required this.personId});

  final String personId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final catalog = ref.watch(catalogProvider);
    return Scaffold(
      appBar: AppBar(),
      body: catalog.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ErrorView(error: e),
        data: (c) {
          final person = c.people[personId];
          if (person == null) {
            return const EmptyState(icon: Icons.person_off_outlined, title: 'Not found', message: 'No such person.');
          }
          final work = c.filmography(personId);
          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
            children: [
              Center(child: PersonAvatar(person: person, radius: 52)),
              const SizedBox(height: 16),
              Text(person.name, textAlign: TextAlign.center, style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 8),
              Text(
                person.bio,
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppColors.textMuted, height: 1.5),
              ),
              const SizedBox(height: 24),
              Text('Filmography on Hotstar Clone', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              for (final (content, credits) in work)
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  onTap: () => openTitle(context, ref, content),
                  leading: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: SizedBox(width: 44, height: 66, child: Artwork(content.poster)),
                  ),
                  title: Text(content.title, style: const TextStyle(fontWeight: FontWeight.w700)),
                  subtitle: Text(
                    [
                      if (content.year != null) '${content.year}',
                      credits.map((cr) => cr.character != null ? 'Voice of ${cr.character}' : cr.role).join(', '),
                    ].join(' · '),
                  ),
                  trailing: const Icon(Icons.chevron_right_rounded),
                ),
            ],
          );
        },
      ),
    );
  }
}
