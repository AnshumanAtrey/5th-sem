import 'package:flutter/material.dart';
import '../../core/theme/ledger_theme.dart';
import '../../data/mock_database.dart';
import '../../state/app_state.dart';

class InventoryScreen extends StatefulWidget {
  final AppState appState;

  const InventoryScreen({super.key, required this.appState});

  @override
  State<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends State<InventoryScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F8FA),
      body: SafeArea(
        bottom: false,
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // Header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Inventory Positions', style: LedgerTypography.headlineLg(fontSize: 22)),
                          Text('4,120 SKUs · 2,304 Bins · Bhiwandi DC',
                              style: LedgerTypography.bodySm(),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    IconButton(
                      icon: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: LedgerColors.outline),
                        ),
                        child: const Icon(Icons.filter_list, size: 20, color: LedgerColors.onSurface),
                      ),
                      onPressed: () {},
                    ),
                  ],
                ),
              ),
            ),

            // Search Bar
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: TextField(
                  controller: _searchController,
                  decoration: InputDecoration(
                    hintText: 'Search SKU, barcode, bin or category...',
                    hintStyle: const TextStyle(fontSize: 13.5, color: Colors.black45),
                    prefixIcon: const Icon(Icons.search, size: 20, color: Colors.black54),
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: LedgerColors.outline),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: const BorderSide(color: LedgerColors.outline),
                    ),
                  ),
                ),
              ),
            ),

            // Visual Warehouse Zones Capacity Meters
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: LedgerColors.outline),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Warehouse Zone Capacity', style: LedgerTypography.headlineMd(fontSize: 15)),
                          Text('Overall: 76% Full', style: LedgerTypography.labelMd(color: const Color(0xFFF59E0B))),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          _buildZoneMeter('Zone A (Apparel)', '1,890 / 2,300', 0.82, const Color(0xFFE01824)),
                          const SizedBox(width: 10),
                          _buildZoneMeter('Zone B (Bottoms)', '1,240 / 2,000', 0.62, const Color(0xFF12994F)),
                          const SizedBox(width: 10),
                          _buildZoneMeter('Zone C (Footwear)', '840 / 1,500', 0.56, const Color(0xFF2563EB)),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // SKUs List with Visual Availability Meters
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('HIGH MOVEMENT SKUS', style: LedgerTypography.labelSm()),
                    const SizedBox(height: 8),
                    ...MockDatabase.products.map((sku) {
                      return _buildSkuCard(sku);
                    }),
                  ],
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
    );
  }

  Widget _buildZoneMeter(String zone, String capacity, double fraction, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: LedgerColors.outline),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(zone, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11), maxLines: 1),
            const SizedBox(height: 4),
            Text(capacity, style: const TextStyle(fontSize: 10, color: Colors.grey)),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(3),
              child: LinearProgressIndicator(
                value: fraction,
                backgroundColor: const Color(0xFFE2E8F0),
                valueColor: AlwaysStoppedAnimation<Color>(color),
                minHeight: 4,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSkuCard(ProductSku sku) {
    final double availFraction = sku.onHand > 0 ? (sku.available / sku.onHand) : 0.0;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: LedgerColors.outline),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.checkroom_outlined, color: LedgerColors.primary, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(sku.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                    const SizedBox(height: 2),
                    Text(
                      '${sku.code} · EAN: ${sku.barcode}',
                      style: LedgerTypography.mono(fontSize: 11, color: Colors.black54),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'MRP ₹${sku.mrp} · Cost ₹${sku.cost}',
                      style: const TextStyle(fontSize: 11, color: Colors.grey),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('${sku.onHand}', style: LedgerTypography.headlineDisplay(fontSize: 20)),
                  const Text('total units', style: TextStyle(fontSize: 10, color: Colors.grey)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Visual Stock Breakdown (On Hand, Reserved, Available, In Transit)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildStockPill('Available', '${sku.available}', const Color(0xFF12994F)),
              _buildStockPill('Reserved', '${sku.reserved}', const Color(0xFFF59E0B)),
              _buildStockPill('In-Transit', '${sku.inTransit}', const Color(0xFF2563EB)),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: availFraction,
              backgroundColor: const Color(0xFFF1F5F9),
              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF12994F)),
              minHeight: 5,
            ),
          ),
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Bins: ${sku.warehouseBins.keys.take(2).join(", ")}',
                style: LedgerTypography.mono(fontSize: 11, color: Colors.black54),
              ),
              GestureDetector(
                onTap: () {
                  widget.appState.selectSku(sku);
                  widget.appState.switchRole(UserRole.manager);
                },
                child: const Text(
                  'View Ledger & Bins →',
                  style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: Color(0xFF2563EB)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStockPill(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Container(width: 6, height: 6, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
          const SizedBox(width: 5),
          Text('$label: ', style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.w500)),
          Text(value, style: TextStyle(fontSize: 11, color: color, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
