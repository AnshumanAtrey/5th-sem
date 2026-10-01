import 'package:flutter/material.dart';
import '../theme/ledger_theme.dart';

class NewGenBottomBar extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTabSelected;
  final VoidCallback onScanPressed;

  const NewGenBottomBar({
    super.key,
    required this.currentIndex,
    required this.onTabSelected,
    required this.onScanPressed,
  });

  @override
  Widget build(BuildContext context) {
    // Dock container with curved borders and glowing border matching the reference
    return Container(
      margin: const EdgeInsets.only(left: 12, right: 12, bottom: 12, top: 4),
      decoration: BoxDecoration(
        color: const Color(0xFF0F1117), // Deep dark sleek background
        borderRadius: BorderRadius.circular(26),
        border: Border.all(
          color: const Color(0xFF3B4261), // Elegant curved outline
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.45),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
          BoxShadow(
            color: const Color(0xFFF59E0B).withValues(alpha: 0.08),
            blurRadius: 25,
            spreadRadius: 1,
          ),
        ],
      ),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          // 1. Dashboard Tab
          _buildNavItem(
            index: 0,
            label: 'Dashboard',
            icon: Icons.grid_view_rounded,
          ),

          // 2. Inbound Tab
          _buildNavItem(
            index: 1,
            label: 'Inbound',
            icon: Icons.archive_outlined,
          ),

          // 3. Center Elevated Barcode Scan Button (Matching user image)
          GestureDetector(
            onTap: onScanPressed,
            child: Container(
              width: 58,
              height: 58,
              margin: const EdgeInsets.symmetric(horizontal: 4),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [
                    Color(0xFFFFAE19),
                    Color(0xFFF59E0B),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFF59E0B).withValues(alpha: 0.45),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Center(
                child: CustomPaint(
                  size: const Size(30, 26),
                  painter: _BarcodeIconPainter(color: const Color(0xFF0D0F14)),
                ),
              ),
            ),
          ),

          // 4. Inventory Tab
          _buildNavItem(
            index: 2,
            label: 'Inventory',
            icon: Icons.inventory_2_outlined,
          ),

          // 5. Outbound Tab
          _buildNavItem(
            index: 3,
            label: 'Outbound',
            icon: Icons.local_shipping_outlined,
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem({
    required int index,
    required String label,
    required IconData icon,
  }) {
    final bool isSelected = currentIndex == index;
    const Color activeColor = Color(0xFFFFAE19); // Glowing amber/orange
    const Color inactiveColor = Color(0xFF7A8499); // Crisp slate text

    return Expanded(
      child: InkWell(
        onTap: () => onTabSelected(index),
        splashColor: Colors.transparent,
        highlightColor: Colors.transparent,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 22,
                color: isSelected ? activeColor : inactiveColor,
              ),
              const SizedBox(height: 5),
              Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontFamily: LedgerTypography.fontMono,
                  fontSize: 10.5,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  letterSpacing: 0.2,
                  color: isSelected ? activeColor : inactiveColor,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Custom painter for the crisp barcode scan icon in the center squircle
class _BarcodeIconPainter extends CustomPainter {
  final Color color;

  _BarcodeIconPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final Paint linePaint = Paint()
      ..color = color
      ..strokeWidth = 2.4
      ..strokeCap = StrokeCap.round;

    final Paint barPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    // Outer corner brackets [  ]
    const double bracketSize = 5.5;

    // Top-left bracket
    canvas.drawLine(const Offset(0, 0), const Offset(bracketSize, 0), linePaint);
    canvas.drawLine(const Offset(0, 0), const Offset(0, bracketSize), linePaint);

    // Top-right bracket
    canvas.drawLine(Offset(size.width, 0), Offset(size.width - bracketSize, 0), linePaint);
    canvas.drawLine(Offset(size.width, 0), Offset(size.width, bracketSize), linePaint);

    // Bottom-left bracket
    canvas.drawLine(Offset(0, size.height), Offset(bracketSize, size.height), linePaint);
    canvas.drawLine(Offset(0, size.height), Offset(0, size.height - bracketSize), linePaint);

    // Bottom-right bracket
    canvas.drawLine(Offset(size.width, size.height), Offset(size.width - bracketSize, size.height), linePaint);
    canvas.drawLine(Offset(size.width, size.height), Offset(size.width, size.height - bracketSize), linePaint);

    // Vertical barcode bars inside
    const double barTop = 3.5;
    final double barBottom = size.height - 3.5;
    final double barHeight = barBottom - barTop;

    final bars = [
      {'x': 5.0, 'w': 2.4},
      {'x': 9.5, 'w': 1.6},
      {'x': 13.0, 'w': 3.2},
      {'x': 18.0, 'w': 1.8},
      {'x': 21.5, 'w': 3.0},
    ];

    for (var b in bars) {
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(b['x']!, barTop, b['w']!, barHeight),
          const Radius.circular(0.8),
        ),
        barPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
