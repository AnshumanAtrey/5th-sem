import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';
import 'core/config/firebase_setup.dart';
import 'core/storage/local_storage.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle.light);
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);

  final (downloads, meta) = await openLocalStorage();
  await initFirebase();

  runApp(
    ProviderScope(
      overrides: [downloadsBoxProvider.overrideWithValue(downloads), metaBoxProvider.overrideWithValue(meta)],
      child: const HotstarCloneApp(),
    ),
  );
}
