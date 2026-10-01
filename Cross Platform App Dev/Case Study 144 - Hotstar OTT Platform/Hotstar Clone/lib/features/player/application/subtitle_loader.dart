import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:video_player/video_player.dart';

/// Downloads sidecar SRT/WebVTT subtitles and hands them to video_player.
///
/// Community subtitle files are messy: byte-order marks, Windows line
/// endings, <i> tags. So each file is cleaned up before parsing.
abstract final class SubtitleLoader {
  static Future<ClosedCaptionFile> load(http.Client client, Uri url) async {
    final res = await client.get(url).timeout(const Duration(seconds: 15));
    if (res.statusCode != 200) throw Exception('Subtitles unavailable (${res.statusCode})');
    final text = normalise(decode(res.bodyBytes));
    return url.path.toLowerCase().endsWith('.vtt') ? WebVTTCaptionFile(text) : SubRipCaptionFile(text);
  }

  static String decode(List<int> bytes) {
    try {
      return utf8.decode(bytes);
    } on FormatException {
      return latin1.decode(bytes); // Older files are often Windows-1252/Latin-1.
    }
  }

  static String normalise(String raw) => raw
      .replaceFirst('﻿', '')
      .replaceAll('\r\n', '\n')
      .replaceAll('\r', '\n')
      .replaceAll(RegExp(r'</?(i|b|u|font)[^>]*>', caseSensitive: false), '')
      .trim();
}
