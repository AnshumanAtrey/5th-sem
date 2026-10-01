// Smoke test + AppState unit tests.
// The old smoke test looked for a 'Ledger' label that the splash screen never shows,
// so it was replaced with a real one that just checks the app boots into a MaterialApp,
// plus a few unit tests on the state logic (the part worth actually testing).

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:warevo/main.dart';
import 'package:warevo/state/app_state.dart';

void main() {
  testWidgets('app boots without throwing and shows a MaterialApp', (tester) async {
    await tester.pumpWidget(const WarevoLedgerApp());
    // the app runs a 1s countdown timer, so pumpAndSettle would hang. one frame is enough.
    await tester.pump();
    expect(find.byType(MaterialApp), findsOneWidget);
    // unmount so the splash + countdown timers get cancelled (no "pending timer" failure).
    await tester.pumpWidget(const SizedBox());
  });

  group('AppState', () {
    test('starts as owner', () {
      final app = AppState();
      expect(app.currentRole, UserRole.owner);
      app.dispose();
    });

    test('switchRole changes the active role', () {
      final app = AppState();
      app.switchRole(UserRole.floor);
      expect(app.currentRole, UserRole.floor);
      app.dispose();
    });

    test('updateGeneratedBins multiplies the grid (zones x aisles x racks x levels)', () {
      final app = AppState();
      app.updateGeneratedBins(2, 3, 4, 5);
      expect(app.generatedBinCount, 120);
      app.dispose();
    });

    test('impersonation flips to owner, ending it returns to super admin', () {
      final app = AppState();
      app.startImpersonation('Ashva Apparel');
      expect(app.isImpersonating, isTrue);
      expect(app.impersonatingTenant, 'Ashva Apparel');
      expect(app.currentRole, UserRole.owner);

      app.stopImpersonation();
      expect(app.isImpersonating, isFalse);
      expect(app.currentRole, UserRole.superAdmin);
      app.dispose();
    });

    test('acceptOrder moves an order into picking', () {
      final app = AppState();
      final id = app.orders.first.id;
      app.acceptOrder(id);
      expect(app.orders.firstWhere((o) => o.id == id).status, 'picking');
      app.dispose();
    });
  });
}
