// Screenshot harness (dev tool, not a real test).
// Named without the _test.dart suffix on purpose, so a plain `flutter test` skips it.
// Renders each role screen to a PNG under screenshots/ so the README can show the app
// without needing a device or emulator. Regenerate the screenshots with:
//     flutter test test/screenshots.dart
// (needs the TTFs in .screenshot_fonts/, they ship with the repo.)
//
// It works fully headless: the app has no network or asset images, everything is drawn
// widgets + Material Icons + text, so a RepaintBoundary.toImage() captures the whole screen.
// We load real Inter + JetBrains Mono fonts so the text is not tofu boxes.

import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:warevo/core/theme/ledger_theme.dart';
import 'package:warevo/features/auth/modern_auth_screen.dart';
import 'package:warevo/features/dashboard/modern_dashboard_screen.dart';
import 'package:warevo/features/inbound/inbound_screen.dart';
import 'package:warevo/features/inventory/inventory_screen.dart';
import 'package:warevo/features/outbound/outbound_screen.dart';
import 'package:warevo/features/floor/floor_flow_screen.dart';
import 'package:warevo/features/manager/manager_flow_screen.dart';
import 'package:warevo/features/store/store_flow_screen.dart';
import 'package:warevo/features/super_admin/super_admin_flow_screen.dart';
import 'package:warevo/state/app_state.dart';

Future<void> _load(String family, String path) async {
  final bytes = File(path).readAsBytesSync();
  final loader = FontLoader(family)..addFont(Future.value(ByteData.view(bytes.buffer)));
  await loader.load();
}

String? _shotName; // set per shot so the overflow logger can name the offending screen

Future<void> _shoot(WidgetTester tester, String name, Widget screen,
    {Size size = const Size(412, 932)}) async {
  _shotName = name;
  await tester.binding.setSurfaceSize(size);
  await tester.pumpWidget(
    MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: LedgerTheme.lightTheme,
      home: RepaintBoundary(key: const Key('shot'), child: screen),
    ),
  );
  // Pump WITHOUT advancing the clock. The app's 1s countdown timer must never fire during a
  // capture: if it does, it schedules a frame mid-shot and toImage() deadlocks waiting on it.
  // Zero-duration pumps lay the screen out at t=0, so the timer stays asleep the whole run.
  await tester.pump();
  await tester.pump();
  final boundary = tester.renderObject<RenderRepaintBoundary>(find.byKey(const Key('shot')));
  // toImage()'s rasterisation completes on the real event loop, not the test's fake clock,
  // so run it inside runAsync() or the second capture onward deadlocks.
  final png = await tester.runAsync(() async {
    final image = await boundary.toImage(pixelRatio: 2.0);
    final data = await image.toByteData(format: ui.ImageByteFormat.png);
    image.dispose();
    return data;
  });
  Directory('screenshots').createSync(recursive: true);
  File('screenshots/$name.png').writeAsBytesSync(png!.buffer.asUint8List());
  // ignore: avoid_print
  print('  wrote screenshots/$name.png');
}

void main() {
  testWidgets('capture screenshots for every role', (tester) async {
    // load the fonts under the exact family strings the theme asks for, plus the fallbacks
    const sans = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    const mono = 'JetBrains Mono, Menlo, Monaco, Consolas, "Courier New", monospace';
    for (final f in [sans, 'Inter', 'Roboto', 'sans-serif', '-apple-system']) {
      await _load(f, '.screenshot_fonts/Inter.ttf');
    }
    for (final f in [mono, 'JetBrains Mono', 'monospace']) {
      await _load(f, '.screenshot_fonts/JetBrainsMono.ttf');
    }
    // icon fonts, otherwise every icon renders as an empty tofu box
    await _load('MaterialIcons', '.screenshot_fonts/MaterialIcons.otf');
    for (final f in ['CupertinoIcons', 'packages/cupertino_icons/CupertinoIcons']) {
      await _load(f, '.screenshot_fonts/CupertinoIcons.ttf');
    }

    // don't let a layout overflow fail the whole run; we just want the picture.
    // but do print which shot overflowed, so we can go fix it.
    final originalOnError = FlutterError.onError;
    FlutterError.onError = (details) {
      if (details.exception.toString().contains('overflow')) {
        // ignore: avoid_print
        print('  !! OVERFLOW during $_shotName: ${details.exception.toString().split("\n").first}');
        return;
      }
      originalOnError?.call(details);
    };

    final app = AppState();
    void role(UserRole r) => app.switchRole(r);

    // 1. login screen with the demo role cards
    await _shoot(tester, '01_login', ModernAuthScreen(appState: app, onLoginSuccess: () {}));

    // 2-4. owner / HQ shell (the polished "modern" design): dashboard, inbound, inventory, outbound
    role(UserRole.owner);
    await _shoot(tester, '02_owner_dashboard',
        ModernDashboardScreen(appState: app, onOpenScanner: () {}));
    await _shoot(tester, '03_inbound', InboundScreen(appState: app));
    await _shoot(tester, '04_inventory', InventoryScreen(appState: app));
    await _shoot(tester, '05_outbound', OutboundScreen(appState: app));

    // 5. floor / picker
    role(UserRole.floor);
    await _shoot(tester, '06_floor_picker', FloorFlowScreen(appState: app));

    // 6. warehouse manager
    role(UserRole.manager);
    await _shoot(tester, '07_manager', ManagerFlowScreen(appState: app));

    // 7. store manager
    role(UserRole.store);
    await _shoot(tester, '08_store', StoreFlowScreen(appState: app));

    // 8. super admin (multi-tenant HQ)
    role(UserRole.superAdmin);
    await _shoot(tester, '09_super_admin', SuperAdminFlowScreen(appState: app));

    FlutterError.onError = originalOnError;
    app.dispose(); // cancel the countdown timer

    // all shots are written by now. the framework's teardown hangs on a live ticker,
    // so bail out cleanly instead of waiting it out. the PNGs are already flushed to disk.
    // ignore: avoid_print
    print('  all screenshots written');
    exit(0);
  });
}
