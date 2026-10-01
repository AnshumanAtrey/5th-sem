import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_ce_flutter/hive_ce_flutter.dart';
import 'package:http/http.dart' as http;

/// Hive boxes are opened once in `main()`, and these providers are
/// overridden with the opened boxes.
final downloadsBoxProvider = Provider<Box<dynamic>>((ref) => throw UnimplementedError('open in main()'));
final metaBoxProvider = Provider<Box<dynamic>>((ref) => throw UnimplementedError('open in main()'));

Future<(Box<dynamic>, Box<dynamic>)> openLocalStorage() async {
  await Hive.initFlutter('hotstar_clone');
  return (await Hive.openBox<dynamic>('downloads'), await Hive.openBox<dynamic>('meta'));
}

/// One shared HTTP client (connection reuse); tests override it.
final httpClientProvider = Provider<http.Client>((ref) {
  final client = http.Client();
  ref.onDispose(client.close);
  return client;
});
