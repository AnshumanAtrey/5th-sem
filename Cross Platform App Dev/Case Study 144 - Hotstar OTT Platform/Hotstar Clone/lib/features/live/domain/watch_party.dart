/// A "live" premiere with no streaming server. Every device computes the
/// same playhead from the wall clock, so viewers who open the party at
/// different times still land on the same second. Phones sync their clocks
/// over the network, so devices typically agree to within a second.
abstract final class WatchParty {
  /// Fixed reference point shared by every device.
  static final anchor = DateTime.utc(2026, 1, 1);

  /// Re-seek if we drift further than this from the shared clock.
  static const maxDrift = Duration(seconds: 3);

  static Duration playhead(DateTime now, Duration loop) {
    if (loop <= Duration.zero) return Duration.zero;
    final elapsed = now.toUtc().difference(anchor).inMilliseconds;
    return Duration(milliseconds: elapsed % loop.inMilliseconds);
  }

  static bool isDrifted(Duration actual, Duration expected, Duration loop) {
    var diff = (actual - expected).inMilliseconds.abs();
    // Just after the loop wraps around, 0:01 and 10:34 are only 2 s apart.
    diff = diff > loop.inMilliseconds ~/ 2 ? loop.inMilliseconds - diff : diff;
    return diff > maxDrift.inMilliseconds;
  }
}
