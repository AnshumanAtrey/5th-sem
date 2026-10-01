import 'package:flutter/material.dart';
import 'core/theme/ledger_theme.dart';
import 'core/widgets/ledger_scanner_dialog.dart';
import 'core/widgets/new_gen_bottom_bar.dart';
import 'features/auth/modern_auth_screen.dart';
import 'features/dashboard/modern_dashboard_screen.dart';
import 'features/inbound/inbound_screen.dart';
import 'features/inventory/inventory_screen.dart';
import 'features/outbound/outbound_screen.dart';
import 'features/splash/splash_screen.dart';
// role-specific flows: each is a self-contained Scaffold picked by the logged-in role
import 'features/floor/floor_flow_screen.dart';
import 'features/manager/manager_flow_screen.dart';
import 'features/store/store_flow_screen.dart';
import 'features/super_admin/super_admin_flow_screen.dart';
import 'state/app_state.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const WarevoLedgerApp());
}

class WarevoLedgerApp extends StatefulWidget {
  const WarevoLedgerApp({super.key});

  @override
  State<WarevoLedgerApp> createState() => _WarevoLedgerAppState();
}

class _WarevoLedgerAppState extends State<WarevoLedgerApp> {
  final AppState _appState = AppState();
  bool _showSplash = true;
  bool _isAuthenticated = false;
  int _activeNavIndex = 0;

  @override
  void initState() {
    super.initState();
    _appState.addListener(_onStateChange);
  }

  @override
  void dispose() {
    _appState.removeListener(_onStateChange);
    _appState.dispose();
    super.dispose();
  }

  void _onStateChange() {
    if (mounted) setState(() {});
  }

  void _openScanner(BuildContext context) {
    LedgerScannerDialog.show(
      context,
      title: 'Scan Barcode / QR',
      subtitle: 'Align SKU or bin barcode inside frame',
      onScanned: (code) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF0F1117),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            content: Text('Scanned: $code · Position Verified'),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Warevo Ledger',
      debugShowCheckedModeBanner: false,
      theme: LedgerTheme.lightTheme,
      home: _showSplash
          ? SplashScreen(
              onAnimationComplete: () {
                setState(() {
                  _showSplash = false;
                });
              },
            )
          : (!_isAuthenticated
              ? ModernAuthScreen(
                  appState: _appState,
                  onLoginSuccess: () {
                    setState(() {
                      _isAuthenticated = true;
                    });
                  },
                )
              : _buildRoleHome()),
    );
  }

  // Route each logged-in role to its own home. The owner/HQ stays on the polished
  // "modern" shell (dashboard + inbound/inventory/outbound). Every other role lands
  // on its dedicated flow screen. Think of it like one building, different key cards:
  // the picker walks into the pick flow, the store manager into the store flow, etc.
  Widget _buildRoleHome() {
    switch (_appState.currentRole) {
      case UserRole.floor:
        return FloorFlowScreen(appState: _appState);
      case UserRole.manager:
        return ManagerFlowScreen(appState: _appState);
      case UserRole.store:
        return StoreFlowScreen(appState: _appState);
      case UserRole.superAdmin:
        return SuperAdminFlowScreen(appState: _appState);
      case UserRole.owner:
      case UserRole.unauthenticated:
        return _buildMainShell();
    }
  }

  Widget _buildMainShell() {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F8FA),
      body: Stack(
        children: [
          // Active Screen
          Positioned.fill(
            child: IndexedStack(
              index: _activeNavIndex,
              children: [
                // 0: Modern Dashboard
                ModernDashboardScreen(
                  appState: _appState,
                  onOpenScanner: () => _openScanner(context),
                ),
                // 1: Inbound
                InboundScreen(appState: _appState),
                // 2: Inventory
                InventoryScreen(appState: _appState),
                // 3: Outbound
                OutboundScreen(appState: _appState),
              ],
            ),
          ),

          // Bottom New-Gen Dock Bar matching user reference image
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: SafeArea(
              top: false,
              child: NewGenBottomBar(
                currentIndex: _activeNavIndex,
                onTabSelected: (idx) {
                  setState(() {
                    _activeNavIndex = idx;
                  });
                },
                onScanPressed: () => _openScanner(context),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
