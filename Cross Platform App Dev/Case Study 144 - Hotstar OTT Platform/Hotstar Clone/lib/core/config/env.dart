/// Build-time configuration, passed with `--dart-define`.
///
/// Local dev on a phone over Wi-Fi:
///   flutter run --dart-define=EMULATOR_HOST=192.168.1.20
/// Also play your laptop's MediaMTX stream in the Live tab:
///   --dart-define=LIVE_URL=http://192.168.1.20:8888/studio/index.m3u8
abstract final class Env {
  /// Talk to the local Firebase Emulator Suite instead of a real project.
  static const useEmulators = bool.fromEnvironment('USE_EMULATORS', defaultValue: true);

  /// Where the emulators run. 10.0.2.2 is the host machine as seen from an
  /// Android emulator; use your laptop's LAN IP for a real phone.
  static const emulatorHost = String.fromEnvironment('EMULATOR_HOST', defaultValue: '10.0.2.2');

  /// Optional HLS URL of a live stream you run yourself (OBS → MediaMTX).
  static const studioLiveUrl = String.fromEnvironment('LIVE_URL');
}
