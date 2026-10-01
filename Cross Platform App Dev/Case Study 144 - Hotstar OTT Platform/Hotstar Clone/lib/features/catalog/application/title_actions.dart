import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../account/data/account_repository.dart';
import '../../parental/application/parental_gate.dart';
import '../../parental/presentation/pin_pad.dart';
import '../../subscription/domain/access_policy.dart';
import '../../subscription/domain/plan.dart';
import '../../subscription/presentation/upgrade_sheet.dart';
import '../domain/age_rating.dart';
import '../domain/content.dart';

extension DeviceClassX on BuildContext {
  DeviceClass get deviceClass => DeviceClass.fromShortestSide(MediaQuery.sizeOf(this).shortestSide);
}

/// Asks for the parental PIN if [rating] is above the profile's limit.
Future<bool> ensureParentalAccess(
  BuildContext context,
  WidgetRef ref, {
  required String id,
  required AgeRating rating,
}) async {
  if (!ref.read(isParentalLockedProvider((id, rating)))) return true;
  final gate = ref.read(parentalGateProvider.notifier);
  return askForPin(
    context,
    title: 'Parental PIN required',
    subtitle: 'This title is rated ${rating.label}. ${rating.description}.',
    attempts: gate.attempts,
    verify: (pin) => gate.unlock(id, pin),
  );
}

/// Checks the plan and device. Shows the upgrade sheet and returns false
/// if they don't allow playback.
bool ensurePlanAccess(BuildContext context, WidgetRef ref, {required Plan required, required String title}) {
  final access = AccessPolicy.canWatch(
    plan: ref.read(effectivePlanProvider),
    required: required,
    device: context.deviceClass,
  );
  switch (access) {
    case Allowed():
      return true;
    case NeedsUpgrade(:final required):
      showUpgradeSheet(context, required: required, reason: '$title needs ${required.label}');
    case DeviceNotSupported(:final plan):
      showUpgradeSheet(
        context,
        required: Plan.superPlan,
        reason: 'The ${plan.label} plan works on phones only. Upgrade to watch on this screen.',
      );
  }
  return false;
}

Future<void> openTitle(BuildContext context, WidgetRef ref, Content content) async {
  if (await ensureParentalAccess(context, ref, id: content.id, rating: content.rating) && context.mounted) {
    context.push('/title/${content.id}');
  }
}

Future<void> playTitle(BuildContext context, WidgetRef ref, Content content) async {
  if (!await ensureParentalAccess(context, ref, id: content.id, rating: content.rating)) return;
  if (!context.mounted) return;
  if (ensurePlanAccess(context, ref, required: content.minPlan, title: content.title)) {
    context.push('/watch/${content.id}');
  }
}

Future<void> joinLive(BuildContext context, WidgetRef ref, LiveChannel channel) async {
  if (!await ensureParentalAccess(context, ref, id: channel.id, rating: channel.rating)) return;
  if (!context.mounted) return;
  if (ensurePlanAccess(context, ref, required: channel.minPlan, title: channel.title)) {
    context.push('/live/${channel.id}');
  }
}
