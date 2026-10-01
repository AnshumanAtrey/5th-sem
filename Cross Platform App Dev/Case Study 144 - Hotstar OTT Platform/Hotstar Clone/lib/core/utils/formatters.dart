/// "1h 5m", "12m", "45s"
String formatRuntime(Duration d) {
  final h = d.inHours;
  final m = d.inMinutes.remainder(60);
  if (h > 0) return m > 0 ? '${h}h ${m}m' : '${h}h';
  if (m > 0) return '${m}m';
  return '${d.inSeconds}s';
}

/// Player clock: "4:05" or "1:02:09"
String formatClock(Duration d) {
  final neg = d.isNegative;
  d = d.abs();
  String two(int n) => n.toString().padLeft(2, '0');
  final h = d.inHours;
  final m = d.inMinutes.remainder(60);
  final s = d.inSeconds.remainder(60);
  final body = h > 0 ? '$h:${two(m)}:${two(s)}' : '$m:${two(s)}';
  return neg ? '-$body' : body;
}

String formatBytes(int bytes) {
  if (bytes < 1024) return '$bytes B';
  const units = ['KB', 'MB', 'GB'];
  var value = bytes / 1024;
  var i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return '${value.toStringAsFixed(value >= 100 ? 0 : 1)} ${units[i]}';
}

/// "Expires in 2 days", "Expires in 5 h", "Expires in 12 min". Days are
/// rounded, so 29 days 23 h reads as 30 days, not 29.
String formatTimeLeft(Duration d) {
  final days = (d.inMinutes / 1440).round();
  if (d.inHours >= 24) return 'Expires in $days ${days == 1 ? 'day' : 'days'}';
  if (d.inHours >= 1) return 'Expires in ${d.inHours} h';
  if (d.inMinutes >= 1) return 'Expires in ${d.inMinutes} min';
  return 'Expires in under a minute';
}

/// "just now", "5m ago", "3h ago", "2d ago", else a date.
String formatAgo(DateTime then, {DateTime? now}) {
  final diff = (now ?? DateTime.now()).difference(then);
  if (diff.inMinutes < 1) return 'just now';
  if (diff.inHours < 1) return '${diff.inMinutes}m ago';
  if (diff.inDays < 1) return '${diff.inHours}h ago';
  if (diff.inDays < 30) return '${diff.inDays}d ago';
  return '${then.day}/${then.month}/${then.year}';
}

/// Compact form for tight buttons: "29d left", "5h left", "12m left".
String formatTimeLeftShort(Duration d) {
  if (d.inHours >= 24) return '${(d.inMinutes / 1440).round()}d left';
  if (d.inHours >= 1) return '${d.inHours}h left';
  return '${d.inMinutes}m left';
}
