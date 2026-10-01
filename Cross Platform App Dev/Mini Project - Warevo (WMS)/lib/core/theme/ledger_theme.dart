import 'package:flutter/material.dart';

/// Ledger Mono Design Tokens strictly derived from DESIGN.md
class LedgerColors {
  // Canvas and surfaces. Pure white background, hairlines do the separation.
  static const Color neutral = Color(0xFFFFFFFF);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceVariant = Color(0xFFF0F0F2);
  static const Color surfacePressed = Color(0xFFF4F4F5);

  // Hairline borders
  static const Color outline = Color(0x1C0A0A0E); // rgba(10, 10, 14, 0.11)
  static const Color outlineStrong = Color(0x2E0A0A0E); // rgba(10, 10, 14, 0.18)

  // Ink ramp. Three greys for text, nothing else.
  static const Color onSurface = Color(0xFF0C0C0E);
  static const Color onSurfaceVariant = Color(0xFF59595F);
  static const Color onSurfaceMuted = Color(0xFF8E8E95);

  // Action. Black is the primary color. Active means filled black with white text.
  static const Color primary = Color(0xFF0C0C0E);
  static const Color onPrimary = Color(0xFFFFFFFF);
  static const Color primarySoft = Color(0x0F0C0C0E); // rgba(12, 12, 14, 0.06)

  // Meaning. Pure semantic cues.
  static const Color positive = Color(0xFF12994F);
  static const Color positiveSoft = Color(0x2112994F); // rgba(18, 153, 79, 0.13)
  static const Color error = Color(0xFFE01824);
  static const Color errorSoft = Color(0x21E01824); // rgba(224, 24, 36, 0.13)

  // Grayscale data ramp for charts & series
  static const Color data1 = Color(0xFF1C1C1F);
  static const Color data2 = Color(0xFF57575E);
  static const Color data3 = Color(0xFF9C9CA3);
  static const Color data4 = Color(0xFFD2D2D7);
}

class LedgerSpacing {
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 24.0;
  static const double xxl = 32.0;

  static const double screenGutter = 16.0;
  static const double cardPadding = 16.0;
  static const double gridGap = 12.0;
  static const double floorTarget = 56.0;
}

class LedgerRadius {
  static const double none = 0.0;
  static const double sm = 6.0;
  static const double md = 8.0;
  static const double lg = 12.0;
  static const double xl = 16.0;
  static const double full = 999.0;
}

class LedgerTypography {
  static const String fontSans = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  static const String fontMono = 'JetBrains Mono, Menlo, Monaco, Consolas, "Courier New", monospace';

  static TextStyle headlineDisplay({Color color = LedgerColors.onSurface, double fontSize = 28}) =>
      TextStyle(
        fontFamily: fontSans,
        fontFamilyFallback: const ['Inter', '-apple-system', 'Roboto', 'sans-serif'],
        fontSize: fontSize,
        fontWeight: FontWeight.w600,
        height: 1.15,
        letterSpacing: -0.67,
        color: color,
        fontFeatures: const [FontFeature.tabularFigures()],
      );

  static TextStyle headlineLg({Color color = LedgerColors.onSurface, double fontSize = 22}) =>
      TextStyle(
        fontFamily: fontSans,
        fontFamilyFallback: const ['Inter', '-apple-system', 'Roboto', 'sans-serif'],
        fontSize: fontSize,
        fontWeight: FontWeight.w600,
        height: 1.2,
        letterSpacing: -0.44,
        color: color,
        fontFeatures: const [FontFeature.tabularFigures()],
      );

  static TextStyle headlineMd({Color color = LedgerColors.onSurface, double fontSize = 15}) =>
      TextStyle(
        fontFamily: fontSans,
        fontFamilyFallback: const ['Inter', '-apple-system', 'Roboto', 'sans-serif'],
        fontSize: fontSize,
        fontWeight: FontWeight.w600,
        height: 1.3,
        letterSpacing: -0.15,
        color: color,
      );

  static TextStyle bodyLg({Color color = LedgerColors.onSurface, double fontSize = 16}) =>
      TextStyle(
        fontFamily: fontSans,
        fontFamilyFallback: const ['Inter', '-apple-system', 'Roboto', 'sans-serif'],
        fontSize: fontSize,
        fontWeight: FontWeight.w400,
        height: 1.45,
        color: color,
      );

  static TextStyle bodyMd({Color color = LedgerColors.onSurface, double fontSize = 14}) =>
      TextStyle(
        fontFamily: fontSans,
        fontFamilyFallback: const ['Inter', '-apple-system', 'Roboto', 'sans-serif'],
        fontSize: fontSize,
        fontWeight: FontWeight.w400,
        height: 1.45,
        color: color,
        fontFeatures: const [FontFeature.tabularFigures()],
      );

  static TextStyle bodySm({Color color = LedgerColors.onSurfaceVariant, double fontSize = 12.5}) =>
      TextStyle(
        fontFamily: fontSans,
        fontFamilyFallback: const ['Inter', '-apple-system', 'Roboto', 'sans-serif'],
        fontSize: fontSize,
        fontWeight: FontWeight.w400,
        height: 1.4,
        color: color,
      );

  static TextStyle labelLg({Color color = LedgerColors.onSurface, double fontSize = 13}) =>
      TextStyle(
        fontFamily: fontSans,
        fontFamilyFallback: const ['Inter', '-apple-system', 'Roboto', 'sans-serif'],
        fontSize: fontSize,
        fontWeight: FontWeight.w500,
        height: 1.2,
        color: color,
      );

  static TextStyle labelMd({Color color = LedgerColors.onSurface, double fontSize = 11.5}) =>
      TextStyle(
        fontFamily: fontSans,
        fontFamilyFallback: const ['Inter', '-apple-system', 'Roboto', 'sans-serif'],
        fontSize: fontSize,
        fontWeight: FontWeight.w600,
        height: 1.2,
        color: color,
        fontFeatures: const [FontFeature.tabularFigures()],
      );

  static TextStyle labelSm({Color color = LedgerColors.onSurfaceMuted, double fontSize = 11}) =>
      TextStyle(
        fontFamily: fontSans,
        fontFamilyFallback: const ['Inter', '-apple-system', 'Roboto', 'sans-serif'],
        fontSize: fontSize,
        fontWeight: FontWeight.w500,
        height: 1.2,
        letterSpacing: 0.66,
        color: color,
      );

  static TextStyle mono({
    Color color = LedgerColors.onSurface,
    double fontSize = 13,
    FontWeight fontWeight = FontWeight.w500,
  }) =>
      TextStyle(
        fontFamily: fontMono,
        fontFamilyFallback: const ['JetBrains Mono', 'Menlo', 'Monaco', 'monospace'],
        fontSize: fontSize,
        fontWeight: fontWeight,
        height: 1.3,
        letterSpacing: -0.26,
        color: color,
        fontFeatures: const [FontFeature.tabularFigures()],
      );

  static TextStyle floorValue({Color color = LedgerColors.onSurface, double fontSize = 40}) =>
      TextStyle(
        fontFamily: fontSans,
        fontFamilyFallback: const ['Inter', '-apple-system', 'Roboto', 'sans-serif'],
        fontSize: fontSize,
        fontWeight: FontWeight.w600,
        height: 1.1,
        letterSpacing: -0.8,
        color: color,
        fontFeatures: const [FontFeature.tabularFigures()],
      );

  static TextStyle floorAction({Color color = LedgerColors.onSurface, double fontSize = 18}) =>
      TextStyle(
        fontFamily: fontSans,
        fontFamilyFallback: const ['Inter', '-apple-system', 'Roboto', 'sans-serif'],
        fontSize: fontSize,
        fontWeight: FontWeight.w600,
        height: 1.2,
        color: color,
      );
}

class LedgerTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: LedgerColors.neutral,
      colorScheme: const ColorScheme.light(
        surface: LedgerColors.surface,
        onSurface: LedgerColors.onSurface,
        primary: LedgerColors.primary,
        onPrimary: LedgerColors.onPrimary,
        error: LedgerColors.error,
        onError: LedgerColors.neutral,
        outline: LedgerColors.outline,
      ),
      dividerTheme: const DividerThemeData(
        color: LedgerColors.outline,
        thickness: 1,
        space: 1,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: LedgerColors.neutral,
        foregroundColor: LedgerColors.onSurface,
        elevation: 0,
        scrolledUnderElevation: 0,
      ),
    );
  }
}
