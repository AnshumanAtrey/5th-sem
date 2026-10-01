import 'dart:async';
import 'package:flutter/material.dart';
import '../data/mock_database.dart';

enum UserRole {
  owner,
  floor,
  manager,
  store,
  superAdmin,
  unauthenticated,
}

class AppState extends ChangeNotifier {
  UserRole _currentRole = UserRole.owner;
  String _impersonatingTenant = '';
  int _activeNavIndex = 0;
  final bool _isSynced = true;
  String _syncStatusText = 'Synced 4m ago';

  // Active orders with countdowns
  List<OrderItem> _orders = [];
  Timer? _countdownTimer;

  // Selected order or item for detail views
  OrderItem? _selectedOrder;
  ProductSku? _selectedSku;
  bool _adjustmentApproved = false;

  // Floor Pick Session State
  int _currentPickStep = 3;
  final int _totalPickSteps = 7;
  bool _scannedCorrectBin = false;
  String? _binScanError;

  // Onboarding Wizard State
  int _wizardStep = 1;
  int _generatedBinCount = 2304;

  AppState() {
    _orders = List.from(MockDatabase.orders);
    _selectedOrder = _orders.isNotEmpty ? _orders.first : null;
    _selectedSku = MockDatabase.products.first;
    _startCountdownTimer();
  }

  UserRole get currentRole => _currentRole;
  String get impersonatingTenant => _impersonatingTenant;
  bool get isImpersonating => _impersonatingTenant.isNotEmpty;
  int get activeNavIndex => _activeNavIndex;
  bool get isSynced => _isSynced;
  String get syncStatusText => _syncStatusText;
  List<OrderItem> get orders => _orders;
  OrderItem? get selectedOrder => _selectedOrder;
  ProductSku? get selectedSku => _selectedSku;
  bool get adjustmentApproved => _adjustmentApproved;
  int get currentPickStep => _currentPickStep;
  int get totalPickSteps => _totalPickSteps;
  bool get scannedCorrectBin => _scannedCorrectBin;
  String? get binScanError => _binScanError;
  int get wizardStep => _wizardStep;
  int get generatedBinCount => _generatedBinCount;

  void switchRole(UserRole newRole) {
    _currentRole = newRole;
    _activeNavIndex = 0;
    if (newRole == UserRole.store) {
      _syncStatusText = 'POS synced 3m ago';
    } else if (newRole == UserRole.floor) {
      _syncStatusText = 'Synced 2m ago';
    } else if (newRole == UserRole.superAdmin) {
      _syncStatusText = 'as of 6 min ago';
    } else {
      _syncStatusText = 'Synced 4m ago';
    }
    notifyListeners();
  }

  void setNavIndex(int index) {
    _activeNavIndex = index;
    notifyListeners();
  }

  void selectOrder(OrderItem order) {
    _selectedOrder = order;
    notifyListeners();
  }

  void selectSku(ProductSku sku) {
    _selectedSku = sku;
    notifyListeners();
  }

  void acceptOrder(String orderId) {
    final idx = _orders.indexWhere((o) => o.id == orderId);
    if (idx != -1) {
      _orders[idx].status = 'picking';
      _orders[idx].remainingSeconds = 0;
      notifyListeners();
    }
  }

  void rejectOrder(String orderId, String reason) {
    final idx = _orders.indexWhere((o) => o.id == orderId);
    if (idx != -1) {
      final order = _orders[idx];
      order.status = 'picking';
      order.currentLocation = 'Phoenix Citadel'; // Re-routed to next location!
      order.remainingSeconds = 600; // Reset 10m for next store
      order.attemptChain.add(
        AttemptStep(
          step: order.attemptChain.length + 1,
          locationName: 'Phoenix Citadel',
          score: 0.88,
          offeredTime: 'Just now',
          outcome: 'offered',
          reason: reason,
          delay: '+6 min',
          cost: '+₹60',
        ),
      );
      notifyListeners();
    }
  }

  void approveStockAdjustment() {
    _adjustmentApproved = true;
    MockDatabase.ledgerEntries.insert(
      0,
      StockLedgerEntry(
        id: 'TXN-9022',
        type: 'ADJUST',
        sku: 'ASH-TEE-OVS-BLK-M',
        fromBin: 'WH1-B-01-04',
        toBin: 'DAMAGED-DISPOSED',
        deltaQty: -200,
        operatorName: 'Meena (Manager)',
        timestamp: 'Just now',
        referenceDoc: 'ADJ-2026-0012',
      ),
    );
    notifyListeners();
  }

  void simulateScanBin(String scannedBin) {
    if (scannedBin == 'WH1-A-03-02') {
      _scannedCorrectBin = true;
      _binScanError = null;
    } else {
      _scannedCorrectBin = false;
      _binScanError = "That's $scannedBin. Go to WH1-A-03-02.";
    }
    notifyListeners();
  }

  void confirmPickLine() {
    if (_currentPickStep < _totalPickSteps) {
      _currentPickStep++;
      _scannedCorrectBin = false;
      _binScanError = null;
      notifyListeners();
    }
  }

  void startImpersonation(String tenantName) {
    _impersonatingTenant = tenantName;
    _currentRole = UserRole.owner;
    notifyListeners();
  }

  void stopImpersonation() {
    _impersonatingTenant = '';
    _currentRole = UserRole.superAdmin;
    notifyListeners();
  }

  void setWizardStep(int step) {
    _wizardStep = step;
    notifyListeners();
  }

  void updateGeneratedBins(int zones, int aisles, int racks, int levels) {
    _generatedBinCount = zones * aisles * racks * levels;
    notifyListeners();
  }

  void _startCountdownTimer() {
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      bool changed = false;
      for (var order in _orders) {
        if (order.remainingSeconds > 0) {
          order.remainingSeconds--;
          changed = true;
        }
      }
      if (changed) {
        notifyListeners();
      }
    });
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }
}
