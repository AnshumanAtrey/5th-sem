/// Just enough HLS master-playlist handling to enforce a plan's quality cap
/// while keeping adaptive bitrate.
///
/// The player can't be told "adapt, but never above 720p". So we do what OTT
/// backends do with manifest manipulation: rewrite the master playlist
/// without the renditions the plan doesn't include. The player then adapts
/// freely among the ones that are left.
class HlsVariant {
  const HlsVariant({required this.height, required this.bandwidth});

  final int? height;
  final int? bandwidth;
}

abstract final class HlsManifest {
  static final _resolution = RegExp(r'RESOLUTION=\d+x(\d+)');
  static final _bandwidth = RegExp(r'[^-]BANDWIDTH=(\d+)');
  static final _uriAttr = RegExp(r'URI="([^"]+)"');

  static bool isMaster(String text) => text.contains('#EXT-X-STREAM-INF');

  static List<HlsVariant> variants(String master) => [
    for (final line in master.split('\n'))
      if (line.startsWith('#EXT-X-STREAM-INF'))
        HlsVariant(
          height: int.tryParse(_resolution.firstMatch(line)?.group(1) ?? ''),
          bandwidth: int.tryParse(_bandwidth.firstMatch(' $line')?.group(1) ?? ''),
        ),
  ];

  /// Distinct heights in the ladder, highest first.
  static List<int> heights(String master) =>
      (variants(master).map((v) => v.height).whereType<int>().toSet().toList()..sort()).reversed.toList();

  static bool needsCap(String master, int maxHeight) => heights(master).any((h) => h > maxHeight);

  /// Returns a master playlist that:
  ///  * drops every variant (and I-frame track) taller than [maxHeight],
  ///    keeping the smallest one if nothing fits the cap;
  ///  * rewrites every relative URI against [base], so the new file can be
  ///    served from anywhere, including the device's temp directory.
  static String capped(String master, {required Uri base, required int maxHeight}) {
    final lines = master.replaceAll('\r\n', '\n').split('\n');
    final allowed = heights(master).where((h) => h <= maxHeight).toList();
    final keepMax = allowed.isNotEmpty ? maxHeight : (heights(master).lastOrNull ?? maxHeight);

    bool tooTall(String line) {
      final h = int.tryParse(_resolution.firstMatch(line)?.group(1) ?? '');
      return h != null && h > keepMax;
    }

    String absolutise(String line) => line.replaceAllMapped(_uriAttr, (m) => 'URI="${base.resolve(m.group(1)!)}"');

    final out = <String>[];
    var skipNextUri = false;
    for (final line in lines) {
      final trimmed = line.trim();
      if (trimmed.isEmpty) continue;
      if (trimmed.startsWith('#EXT-X-STREAM-INF')) {
        skipNextUri = tooTall(trimmed);
        if (!skipNextUri) out.add(absolutise(trimmed));
      } else if (trimmed.startsWith('#EXT-X-I-FRAME-STREAM-INF')) {
        if (!tooTall(trimmed)) out.add(absolutise(trimmed));
      } else if (trimmed.startsWith('#')) {
        out.add(absolutise(trimmed));
      } else {
        // A URI line belongs to the #EXT-X-STREAM-INF just before it.
        if (!skipNextUri) out.add(base.resolve(trimmed).toString());
        skipNextUri = false;
      }
    }
    return '${out.join('\n')}\n';
  }
}
