import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/validators.dart';
import '../../../core/widgets/badges.dart';
import '../../../core/widgets/brand.dart';
import '../../account/data/account_repository.dart';
import '../../account/domain/user_profile.dart';
import '../../auth/data/auth_repository.dart';
import '../../subscription/domain/plan.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final profile = ref.watch(profileProvider).value;
    final plan = ref.watch(effectivePlanProvider);
    final viaFamily = ref.watch(isFamilyMemberProvider);
    final parental = ref.watch(parentalSettingsProvider);
    final text = Theme.of(context).textTheme;
    final name = profile?.displayName ?? user?.displayName ?? '';

    return Scaffold(
      appBar: AppBar(title: const Text('My Space')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 30,
                backgroundColor: AppColors.surfaceHighest,
                child: Text(
                  name.isEmpty ? '?' : name[0].toUpperCase(),
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: text.titleLarge),
                    Text(user?.email ?? '', style: const TextStyle(color: AppColors.textMuted)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          _PlanCard(plan: plan, viaFamily: viaFamily),
          if (profile != null && profile.plan.familySharing) ...[
            const SizedBox(height: 12),
            _FamilyCard(profile: profile),
          ],
          const SizedBox(height: 12),
          _Tile(
            icon: Icons.shield_moon_outlined,
            title: 'Parental controls',
            subtitle: !parental.hasPin
                ? 'Off · set a PIN to lock mature titles'
                : parental.enabled
                ? 'On · titles above ${parental.maxRating.label} need the PIN'
                : 'PIN set · currently off',
            onTap: () => context.push('/parental'),
          ),
          _Tile(
            icon: Icons.download_outlined,
            title: 'Downloads',
            subtitle: 'Watch offline',
            onTap: () => context.go('/downloads'),
          ),
          _Tile(
            icon: Icons.info_outline_rounded,
            title: 'About & licences',
            subtitle: 'Film credits and open-source licences',
            onTap: () => showLicensePage(
              context: context,
              applicationName: Brand.name,
              applicationLegalese:
                  'Films: Blender Foundation open movies (CC BY). Test streams courtesy of Mux, Unified Streaming, '
                  'Shaka Player and THEOplayer. Font: Manrope (SIL OFL).',
            ),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () => ref.read(authRepositoryProvider).signOut(),
            icon: const Icon(Icons.logout_rounded),
            label: const Text('Sign out'),
          ),
        ],
      ),
    );
  }
}

class _PlanCard extends StatelessWidget {
  const _PlanCard({required this.plan, required this.viaFamily});

  final Plan plan;
  final bool viaFamily;

  @override
  Widget build(BuildContext context) {
    final colors = TierBadge.colors(plan);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [colors.first.withValues(alpha: 0.28), AppColors.surface],
        ),
        border: Border.all(color: colors.first.withValues(alpha: 0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              TierBadge(plan, large: true),
              const Spacer(),
              Text(plan.priceLabel, style: const TextStyle(fontWeight: FontWeight.w800)),
            ],
          ),
          if (viaFamily) ...[
            const SizedBox(height: 8),
            const Text(
              'Shared with you through a family Premium plan',
              style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.w600),
            ),
          ],
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final b in plan.benefits)
                Chip(
                  label: Text(b, style: const TextStyle(fontSize: 12)),
                  visualDensity: VisualDensity.compact,
                ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: () => context.push('/plans'),
              child: Text(plan == Plan.premium ? 'Manage plan' : 'Upgrade'),
            ),
          ),
        ],
      ),
    );
  }
}

class _FamilyCard extends ConsumerStatefulWidget {
  const _FamilyCard({required this.profile});

  final UserProfile profile;

  @override
  ConsumerState<_FamilyCard> createState() => _FamilyCardState();
}

class _FamilyCardState extends ConsumerState<_FamilyCard> {
  final _form = GlobalKey<FormState>();
  final _email = TextEditingController();

  @override
  void dispose() {
    _email.dispose();
    super.dispose();
  }

  String? _validate(String? value) {
    final base = Validators.email(value);
    if (base != null) return base;
    final email = value!.trim().toLowerCase();
    if (email == widget.profile.email) return "That's you";
    if (widget.profile.familyEmails.contains(email)) return 'Already in your family';
    if (widget.profile.familyEmails.length >= Plan.familyLimit) return 'Family is full (${Plan.familyLimit} members)';
    return null;
  }

  Future<void> _add() async {
    if (!_form.currentState!.validate()) return;
    final emails = [...widget.profile.familyEmails, _email.text.trim().toLowerCase()];
    await ref.read(accountRepositoryProvider).setFamily(widget.profile.uid, emails);
    _email.clear();
  }

  @override
  Widget build(BuildContext context) {
    final family = widget.profile.familyEmails;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(18)),
      child: Form(
        key: _form,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.family_restroom_rounded, color: AppColors.gold),
                const SizedBox(width: 10),
                Text('Family sharing', style: Theme.of(context).textTheme.titleMedium),
                const Spacer(),
                Text('${family.length}/${Plan.familyLimit}', style: const TextStyle(color: AppColors.textMuted)),
              ],
            ),
            const SizedBox(height: 4),
            const Text(
              'Members get Premium when they sign in with this email.',
              style: TextStyle(color: AppColors.textMuted),
            ),
            for (final e in family)
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.person_outline_rounded),
                title: Text(e),
                trailing: IconButton(
                  tooltip: 'Remove $e',
                  icon: const Icon(Icons.remove_circle_outline_rounded),
                  onPressed: () => ref
                      .read(accountRepositoryProvider)
                      .setFamily(widget.profile.uid, family.where((x) => x != e).toList()),
                ),
              ),
            if (family.length < Plan.familyLimit) ...[
              const SizedBox(height: 10),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _email,
                      keyboardType: TextInputType.emailAddress,
                      autocorrect: false,
                      decoration: const InputDecoration(labelText: 'Invite by email', isDense: true),
                      validator: _validate,
                      onFieldSubmitted: (_) => _add(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: FilledButton(onPressed: _add, child: const Text('Add')),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _Tile extends StatelessWidget {
  const _Tile({required this.icon, required this.title, required this.subtitle, required this.onTap});

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(bottom: 10),
    color: AppColors.surface,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
    child: ListTile(
      onTap: onTap,
      leading: Icon(icon),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.chevron_right_rounded),
    ),
  );
}
