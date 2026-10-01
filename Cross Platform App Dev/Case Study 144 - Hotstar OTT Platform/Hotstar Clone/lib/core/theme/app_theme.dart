import 'package:flutter/material.dart';

/// Brand colours that sit outside the Material colour scheme.
abstract final class AppColors {
  static const background = Color(0xFF07090F);
  static const surface = Color(0xFF0F131C);
  static const surfaceHigh = Color(0xFF171C28);
  static const surfaceHighest = Color(0xFF212838);
  static const outline = Color(0xFF2A3142);
  static const primary = Color(0xFF5B8CFF);
  static const live = Color(0xFFFF3B5C);
  static const textMuted = Color(0xFF98A2B6);
  static const gold = Color(0xFFF5C451);
  static const goldDeep = Color(0xFFE39A2D);
  static const teal = Color(0xFF2DD4BF);
}

abstract final class AppTheme {
  static ThemeData dark() {
    final scheme = ColorScheme.fromSeed(seedColor: AppColors.primary, brightness: Brightness.dark).copyWith(
      primary: AppColors.primary,
      onPrimary: Colors.white,
      surface: AppColors.surface,
      surfaceContainerLowest: AppColors.background,
      surfaceContainerLow: AppColors.surface,
      surfaceContainer: AppColors.surfaceHigh,
      surfaceContainerHigh: AppColors.surfaceHigh,
      surfaceContainerHighest: AppColors.surfaceHighest,
      outline: AppColors.outline,
      outlineVariant: AppColors.outline,
      error: AppColors.live,
    );

    final base = ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      fontFamily: 'Manrope',
      fontFamilyFallback: const ['ManropeExt'],
      scaffoldBackgroundColor: AppColors.background,
      splashFactory: InkSparkle.splashFactory,
    );

    final text = base.textTheme.apply(bodyColor: Colors.white, displayColor: Colors.white);

    return base.copyWith(
      textTheme: text.copyWith(
        displaySmall: text.displaySmall?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -1),
        headlineMedium: text.headlineMedium?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.5),
        headlineSmall: text.headlineSmall?.copyWith(fontWeight: FontWeight.w800, letterSpacing: -0.3),
        titleLarge: text.titleLarge?.copyWith(fontWeight: FontWeight.w700),
        titleMedium: text.titleMedium?.copyWith(fontWeight: FontWeight.w700),
        titleSmall: text.titleSmall?.copyWith(fontWeight: FontWeight.w700),
        labelLarge: text.labelLarge?.copyWith(fontWeight: FontWeight.w700),
        bodyMedium: text.bodyMedium?.copyWith(height: 1.45),
        bodySmall: text.bodySmall?.copyWith(color: AppColors.textMuted),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: AppColors.surface,
        indicatorColor: AppColors.primary.withValues(alpha: 0.18),
        height: 68,
        labelTextStyle: WidgetStateProperty.resolveWith(
          (states) => TextStyle(
            fontSize: 12,
            fontWeight: states.contains(WidgetState.selected) ? FontWeight.w700 : FontWeight.w500,
            color: states.contains(WidgetState.selected) ? Colors.white : AppColors.textMuted,
          ),
        ),
        iconTheme: WidgetStateProperty.resolveWith(
          (states) => IconThemeData(color: states.contains(WidgetState.selected) ? Colors.white : AppColors.textMuted),
        ),
      ),
      navigationRailTheme: NavigationRailThemeData(
        backgroundColor: AppColors.surface,
        indicatorColor: AppColors.primary.withValues(alpha: 0.18),
        selectedIconTheme: const IconThemeData(color: Colors.white),
        unselectedIconTheme: const IconThemeData(color: AppColors.textMuted),
        selectedLabelTextStyle: const TextStyle(
          fontFamily: 'Manrope',
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
        unselectedLabelTextStyle: const TextStyle(fontFamily: 'Manrope', color: AppColors.textMuted),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(0, 48),
          padding: const EdgeInsets.symmetric(horizontal: 20),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontFamily: 'Manrope', fontWeight: FontWeight.w700, fontSize: 15),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(0, 48),
          foregroundColor: Colors.white,
          side: const BorderSide(color: AppColors.outline),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontFamily: 'Manrope', fontWeight: FontWeight.w700, fontSize: 15),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfaceHigh,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.outline),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: AppColors.live),
        ),
      ),
      chipTheme: base.chipTheme.copyWith(
        backgroundColor: AppColors.surfaceHigh,
        side: const BorderSide(color: AppColors.outline),
        labelStyle: const TextStyle(fontFamily: 'Manrope', fontWeight: FontWeight.w600),
      ),
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppColors.surface,
        surfaceTintColor: Colors.transparent,
        showDragHandle: true,
      ),
      dialogTheme: const DialogThemeData(backgroundColor: AppColors.surfaceHigh, surfaceTintColor: Colors.transparent),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.surfaceHighest,
        contentTextStyle: const TextStyle(fontFamily: 'Manrope', color: Colors.white),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      dividerTheme: const DividerThemeData(color: AppColors.outline, space: 1),
      sliderTheme: const SliderThemeData(
        trackHeight: 3,
        activeTrackColor: AppColors.primary,
        inactiveTrackColor: Colors.white24,
        thumbColor: Colors.white,
        overlayShape: RoundSliderOverlayShape(overlayRadius: 14),
        thumbShape: RoundSliderThumbShape(enabledThumbRadius: 7),
      ),
    );
  }
}
