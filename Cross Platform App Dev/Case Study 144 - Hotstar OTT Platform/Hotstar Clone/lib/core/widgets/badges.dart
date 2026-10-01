import 'package:flutter/material.dart';

import '../../features/catalog/domain/age_rating.dart';
import '../../features/subscription/domain/plan.dart';
import '../theme/app_theme.dart';

class AgeRatingBadge extends StatelessWidget {
  const AgeRatingBadge(this.rating, {super.key, this.compact = false});

  final AgeRating rating;
  final bool compact;

  Color get _color => switch (rating) {
    AgeRating.u => AppColors.teal,
    AgeRating.ua7 => const Color(0xFF7DD3FC),
    AgeRating.ua13 => AppColors.gold,
    AgeRating.ua16 => const Color(0xFFFB923C),
    AgeRating.a => AppColors.live,
  };

  @override
  Widget build(BuildContext context) => Tooltip(
    message: rating.description,
    child: Container(
      padding: EdgeInsets.symmetric(horizontal: compact ? 5 : 7, vertical: compact ? 1 : 3),
      decoration: BoxDecoration(
        border: Border.all(color: _color.withValues(alpha: 0.8)),
        borderRadius: BorderRadius.circular(5),
      ),
      child: Text(
        rating.label,
        style: TextStyle(color: _color, fontSize: compact ? 10 : 12, fontWeight: FontWeight.w800, letterSpacing: 0.2),
      ),
    ),
  );
}

/// Gradient pill for a subscription tier.
class TierBadge extends StatelessWidget {
  const TierBadge(this.plan, {super.key, this.onTap, this.large = false});

  final Plan plan;
  final VoidCallback? onTap;
  final bool large;

  static List<Color> colors(Plan plan) => switch (plan) {
    Plan.free => const [Color(0xFF3B4254), Color(0xFF2A3040)],
    Plan.mobile => const [Color(0xFF14B8A6), Color(0xFF0E7490)],
    Plan.superPlan => const [Color(0xFF5B8CFF), Color(0xFF3B5BDB)],
    Plan.premium => const [AppColors.gold, AppColors.goldDeep],
  };

  @override
  Widget build(BuildContext context) {
    final fg = plan == Plan.premium ? const Color(0xFF2B1A00) : Colors.white;
    final pill = Container(
      padding: EdgeInsets.symmetric(horizontal: large ? 12 : 7, vertical: large ? 6 : 3),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: colors(plan)),
        borderRadius: BorderRadius.circular(large ? 20 : 5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (plan == Plan.premium) ...[
            Icon(Icons.workspace_premium_rounded, size: large ? 16 : 11, color: fg),
            SizedBox(width: large ? 5 : 3),
          ],
          Text(
            plan.label.toUpperCase(),
            style: TextStyle(color: fg, fontSize: large ? 12 : 9, fontWeight: FontWeight.w800, letterSpacing: 0.8),
          ),
        ],
      ),
    );
    if (onTap == null) return pill;
    return InkWell(borderRadius: BorderRadius.circular(20), onTap: onTap, child: pill);
  }
}

class LiveBadge extends StatelessWidget {
  const LiveBadge({super.key, this.label = 'LIVE'});

  final String label;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
    decoration: BoxDecoration(color: AppColors.live, borderRadius: BorderRadius.circular(5)),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const _Pulse(),
        const SizedBox(width: 5),
        Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.8)),
      ],
    ),
  );
}

class _Pulse extends StatefulWidget {
  const _Pulse();

  @override
  State<_Pulse> createState() => _PulseState();
}

class _PulseState extends State<_Pulse> with SingleTickerProviderStateMixin {
  late final _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 900))..repeat(reverse: true);

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => FadeTransition(
    opacity: Tween(begin: 0.35, end: 1.0).animate(_c),
    child: Container(
      width: 6,
      height: 6,
      decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
    ),
  );
}
