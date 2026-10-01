import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

abstract final class Brand {
  static const name = 'Hotstar Clone';
  static const tagline = 'Open cinema, streamed everywhere.';
}

class BrandMark extends StatelessWidget {
  const BrandMark({super.key, this.size = 22});

  final double size;

  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Container(
        width: size * 1.25,
        height: size * 1.25,
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [AppColors.primary, Color(0xFFA855F7)]),
          borderRadius: BorderRadius.circular(size * 0.35),
        ),
        child: Icon(Icons.play_arrow_rounded, color: Colors.white, size: size),
      ),
      SizedBox(width: size * 0.4),
      Text(
        Brand.name,
        style: TextStyle(fontSize: size, fontWeight: FontWeight.w800, letterSpacing: -0.5),
      ),
    ],
  );
}
