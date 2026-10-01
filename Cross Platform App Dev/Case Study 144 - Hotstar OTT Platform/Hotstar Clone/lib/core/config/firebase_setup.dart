import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

import 'env.dart';

/// Projects whose id starts with `demo-` never touch a real Firebase project.
/// The Emulator Suite accepts them without credentials, so these placeholder
/// options are enough for local development. For a real project, run
/// `flutterfire configure` and pass `DefaultFirebaseOptions.currentPlatform`.
const _demoOptions = FirebaseOptions(
  apiKey: 'demo-api-key',
  appId: '1:000000000000:android:0000000000000000',
  messagingSenderId: '000000000000',
  projectId: 'demo-hotstar-clone',
);

Future<void> initFirebase() async {
  await Firebase.initializeApp(options: _demoOptions);
  if (Env.useEmulators) {
    await FirebaseAuth.instance.useAuthEmulator(Env.emulatorHost, 9099);
    FirebaseFirestore.instance.useFirestoreEmulator(Env.emulatorHost, 8080);
    debugPrint('Firebase → emulators at ${Env.emulatorHost}');
  }
}
