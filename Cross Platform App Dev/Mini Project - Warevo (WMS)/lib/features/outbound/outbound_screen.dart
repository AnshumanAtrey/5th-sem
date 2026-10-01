import 'package:flutter/material.dart';
import '../../core/theme/ledger_theme.dart';
import '../../state/app_state.dart';

class OutboundScreen extends StatefulWidget {
  final AppState appState;

  const OutboundScreen({super.key, required this.appState});

  @override
  State<OutboundScreen> createState() => _OutboundScreenState();
}

class _OutboundScreenState extends State<OutboundScreen> {
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
                          Text('Outbound Fulfillment', style: LedgerTypography.headlineLg(fontSize: 22)),
                          Text('Omnichannel routing · Packing · Carrier dispatch',
                              style: LedgerTypography.bodySm(),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: const Color(0xFF12994F).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.bolt, size: 14, color: Color(0xFF12994F)),
                          SizedBox(width: 4),
                          Text('94% On-time', style: TextStyle(color: Color(0xFF12994F), fontWeight: FontWeight.bold, fontSize: 11)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Visual Order Fulfillment Funnel
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
                      Text('Fulfillment Pipeline', style: LedgerTypography.headlineMd(fontSize: 15)),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          _buildFunnelStage('Confirmed', '22', 0.9, const Color(0xFF64748B)),
                          _buildFunnelArrow(),
                          _buildFunnelStage('Picking', '9', 0.65, const Color(0xFFF59E0B)),
                          _buildFunnelArrow(),
                          _buildFunnelStage('Packed', '6', 0.45, const Color(0xFF2563EB)),
                          _buildFunnelArrow(),
                          _buildFunnelStage('Dispatched', '148', 1.0, const Color(0xFF12994F)),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Active Dispatches with Courier Tracking Cards
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('DISPATCH QUEUE', style: LedgerTypography.labelSm()),
                        Text('Sorted by SLA cut-off', style: LedgerTypography.bodySm(fontSize: 11)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    _buildDispatchCard(
                      orderId: 'SO-2026-0417',
                      carrier: 'Delhivery Surface',
                      awb: 'AWB 2891 7743 2210',
                      dest: 'Gomti Nagar, Lucknow',
                      slaCutoff: '16:00 (In 1h 15m)',
                      items: '3 items · ₹4,197',
                      status: 'Packed · Ready for handover',
                      statusColor: const Color(0xFF2563EB),
                      isUrgent: true,
                    ),
                    const SizedBox(height: 12),
                    _buildDispatchCard(
                      orderId: 'SO-2026-0416',
                      carrier: 'BlueDart Express',
                      awb: 'AWB 7192 8810 4491',
                      dest: 'Indore, MP',
                      slaCutoff: 'Dispatched 12:40',
                      items: '1 item · ₹1,299',
                      status: 'Handed to Courier',
                      statusColor: const Color(0xFF12994F),
                      isUrgent: false,
                    ),
                    const SizedBox(height: 12),
                    _buildDispatchCard(
                      orderId: 'SO-2026-0415',
                      carrier: 'Store Click & Collect',
                      awb: 'PIN: 9021',
                      dest: 'Phoenix Palassio Store',
                      slaCutoff: 'Customer arriving 17:30',
                      items: '2 items · ₹2,598',
                      status: 'At Store Counter',
                      statusColor: const Color(0xFFF59E0B),
                      isUrgent: false,
                    ),
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

  Widget _buildFunnelStage(String label, String count, double fillFraction, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Text(count, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: color)),
            const SizedBox(height: 2),
            Text(label, style: TextStyle(fontSize: 10, color: color, fontWeight: FontWeight.w600), maxLines: 1),
          ],
        ),
      ),
    );
  }

  Widget _buildFunnelArrow() {
    return const Padding(
      padding: EdgeInsets.symmetric(horizontal: 2),
      child: Icon(Icons.chevron_right, size: 14, color: Colors.grey),
    );
  }

  Widget _buildDispatchCard({
    required String orderId,
    required String carrier,
    required String awb,
    required String dest,
    required String slaCutoff,
    required String items,
    required String status,
    required Color statusColor,
    required bool isUrgent,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isUrgent ? const Color(0xFFF59E0B) : LedgerColors.outline,
          width: isUrgent ? 1.4 : 1,
        ),
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
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Expanded so a long carrier name ellipsizes instead of shoving the status badge off the card.
              Expanded(
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.local_shipping_outlined, size: 18, color: LedgerColors.primary),
                    ),
                    const SizedBox(width: 10),
                    Flexible(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(orderId, style: LedgerTypography.mono(fontSize: 14, fontWeight: FontWeight.bold)),
                          Text(carrier,
                              style: const TextStyle(fontSize: 12, color: Colors.black87),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  status,
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: statusColor),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(dest, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
              Text(items, style: const TextStyle(fontSize: 12, color: Colors.grey)),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(awb, style: LedgerTypography.mono(fontSize: 11.5, color: Colors.black54)),
              Row(
                children: [
                  Icon(Icons.schedule, size: 12, color: isUrgent ? const Color(0xFFE01824) : Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    slaCutoff,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: isUrgent ? FontWeight.bold : FontWeight.normal,
                      color: isUrgent ? const Color(0xFFE01824) : Colors.grey,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
