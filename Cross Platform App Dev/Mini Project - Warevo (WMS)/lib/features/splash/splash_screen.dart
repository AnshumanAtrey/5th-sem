import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme/ledger_theme.dart';

class SplashScreen extends StatefulWidget {
  final VoidCallback onAnimationComplete;

  const SplashScreen({super.key, required this.onAnimationComplete});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _logoScale;
  late Animation<double> _logoFade;
  late Animation<double> _textFade;
  late Animation<double> _progressAnim;
  Timer? _advanceTimer;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2400),
    );

    _logoScale = Tween<double>(begin: 0.7, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.5, curve: Curves.easeOutCubic),
      ),
    );

    _logoFade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.4, curve: Curves.easeIn),
      ),
    );

    _textFade = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.35, 0.7, curve: Curves.easeIn),
      ),
    );

    _progressAnim = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.5, 0.95, curve: Curves.easeInOutCubic),
      ),
    );

    _controller.forward();

    _advanceTimer = Timer(const Duration(milliseconds: 2800), () {
      if (mounted) {
        widget.onAnimationComplete();
      }
    });
  }

  @override
  void dispose() {
    _advanceTimer?.cancel(); // don't let the timer fire onto a disposed widget
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LedgerColors.neutral,
      body: SafeArea(
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Spacer(),
                    // Monogram Logo Mark
                    Opacity(
                      opacity: _logoFade.value,
                      child: Transform.scale(
                        scale: _logoScale.value,
                        child: Container(
                          width: 88,
                          height: 88,
                          decoration: BoxDecoration(
                            color: LedgerColors.primary,
                            borderRadius: BorderRadius.circular(LedgerRadius.xl),
                            border: Border.all(color: LedgerColors.outlineStrong, width: 1),
                          ),
                          alignment: Alignment.center,
                          child: Stack(
                            alignment: Alignment.center,
                            children: [
                              // Geometric ledger grid symbol
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(
                                    width: 14,
                                    height: 38,
                                    decoration: BoxDecoration(
                                      color: LedgerColors.onPrimary,
                                      borderRadius: BorderRadius.circular(3),
                                    ),
                                  ),
                                  const SizedBox(width: 5),
                                  Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Container(
                                        width: 14,
                                        height: 16,
                                        decoration: BoxDecoration(
                                          color: LedgerColors.onPrimary.withValues(alpha: 0.6),
                                          borderRadius: BorderRadius.circular(3),
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Container(
                                        width: 14,
                                        height: 16,
                                        decoration: BoxDecoration(
                                          color: LedgerColors.positive,
                                          borderRadius: BorderRadius.circular(3),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: LedgerSpacing.xl),
                    // Wordmark & Tagline
                    Opacity(
                      opacity: _textFade.value,
                      child: Column(
                        children: [
                          Text(
                            'Ledger',
                            style: LedgerTypography.headlineDisplay(fontSize: 32),
                          ),
                          const SizedBox(height: LedgerSpacing.xs),
                          Text(
                            'Know where every unit is.',
                            style: LedgerTypography.bodyMd(color: LedgerColors.onSurfaceVariant),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    // Loading progress line
                    Opacity(
                      opacity: _textFade.value,
                      child: Column(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(LedgerRadius.full),
                            child: SizedBox(
                              width: 140,
                              height: 3,
                              child: LinearProgressIndicator(
                                value: _progressAnim.value,
                                backgroundColor: LedgerColors.surfaceVariant,
                                valueColor: const AlwaysStoppedAnimation<Color>(LedgerColors.primary),
                              ),
                            ),
                          ),
                          const SizedBox(height: LedgerSpacing.md),
                          Text(
                            'INITIALIZING MULTI-TENANT LEDGER',
                            style: LedgerTypography.labelSm(color: LedgerColors.onSurfaceMuted),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: LedgerSpacing.xl),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
