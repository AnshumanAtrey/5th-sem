import 'package:hotstar_clone/features/player/domain/hls_manifest.dart';
import 'package:flutter_test/flutter_test.dart';

// Real master playlists (trimmed) from the catalogue's streams.
const muxBbb = '''#EXTM3U
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=2149280,CODECS="mp4a.40.2,avc1.64001f",RESOLUTION=1280x720,NAME="720"
url_0/193039199_mp4_h264_aac_hd_7.m3u8
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=246440,CODECS="mp4a.40.5,avc1.42000d",RESOLUTION=320x184,NAME="240"
url_2/193039199_mp4_h264_aac_ld_7.m3u8
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=460560,CODECS="mp4a.40.5,avc1.420016",RESOLUTION=512x288,NAME="380"
url_4/193039199_mp4_h264_aac_7.m3u8
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=836280,CODECS="mp4a.40.2,avc1.64001f",RESOLUTION=848x480,NAME="480"
url_6/193039199_mp4_h264_aac_hq_7.m3u8
#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=6221600,CODECS="mp4a.40.2,avc1.640028",RESOLUTION=1920x1080,NAME="1080"
url_8/193039199_mp4_h264_aac_fhd_7.m3u8
''';

const unifiedTos = '''#EXTM3U\r
#EXT-X-VERSION:6\r
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-aacl-64",LANGUAGE="en",NAME="English",DEFAULT=YES,AUTOSELECT=YES,CHANNELS="2",URI="tears-of-steel-multi-lang-audio_eng=64008.m3u8"\r
#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="audio-aacl-64",LANGUAGE="it",NAME="Italian",AUTOSELECT=YES,CHANNELS="2",URI="tears-of-steel-multi-lang-audio_ita=64008.m3u8"\r
#EXT-X-STREAM-INF:AVERAGE-BANDWIDTH=450000,BANDWIDTH=493000,CODECS="mp4a.40.2,avc1.42C00D",RESOLUTION=224x100,AUDIO="audio-aacl-64"\r
tears-of-steel-multi-lang-video_eng=401000.m3u8\r
#EXT-X-STREAM-INF:BANDWIDTH=1129000,CODECS="mp4a.40.2,avc1.4D401F",RESOLUTION=784x350,AUDIO="audio-aacl-64"\r
tears-of-steel-multi-lang-video_eng=1001000.m3u8\r
#EXT-X-STREAM-INF:BANDWIDTH=4000000,CODECS="mp4a.40.2,avc1.640028",RESOLUTION=1680x750,AUDIO="audio-aacl-64"\r
tears-of-steel-multi-lang-video_eng=3801000.m3u8\r
#EXT-X-I-FRAME-STREAM-INF:BANDWIDTH=300000,RESOLUTION=1680x750,URI="keyframes/tears-of-steel-video_eng=3801000.m3u8"\r
''';

void main() {
  final muxBase = Uri.parse('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
  final tosBase = Uri.parse('https://demo.unified-streaming.com/k8s/tos/tears-of-steel-multi-lang.ism/.m3u8');

  group('reading the ladder', () {
    test('detects master playlists', () {
      expect(HlsManifest.isMaster(muxBbb), isTrue);
      expect(HlsManifest.isMaster('#EXTM3U\n#EXTINF:6,\nseg1.ts'), isFalse);
    });

    test('lists distinct heights, highest first', () {
      expect(HlsManifest.heights(muxBbb), [1080, 720, 480, 288, 184]);
      expect(HlsManifest.heights(unifiedTos), [750, 350, 100]);
    });

    test('reads BANDWIDTH, not AVERAGE-BANDWIDTH', () {
      expect(HlsManifest.variants(unifiedTos).first.bandwidth, 493000);
    });

    test('knows when a plan needs capping', () {
      expect(HlsManifest.needsCap(muxBbb, 480), isTrue);
      expect(HlsManifest.needsCap(muxBbb, 2160), isFalse);
    });
  });

  group('capping', () {
    test('Free (480p) keeps 480p and below and drops 720p/1080p', () {
      final out = HlsManifest.capped(muxBbb, base: muxBase, maxHeight: 480);
      expect(HlsManifest.heights(out), [480, 288, 184]);
      expect(out, isNot(contains('fhd_7')));
      expect(out, isNot(contains('hd_7.m3u8\n#')));
    });

    test('rewrites relative variant URIs to absolute ones', () {
      final out = HlsManifest.capped(muxBbb, base: muxBase, maxHeight: 480);
      expect(out, contains('https://test-streams.mux.dev/x36xhzz/url_6/193039199_mp4_h264_aac_hq_7.m3u8'));
      final uriLines = out.split('\n').where((l) => l.isNotEmpty && !l.startsWith('#'));
      expect(uriLines, everyElement(startsWith('https://')));
    });

    test('rewrites URI="…" attributes (audio renditions) and keeps them', () {
      final out = HlsManifest.capped(unifiedTos, base: tosBase, maxHeight: 480);
      expect(
        out,
        contains(
          'URI="https://demo.unified-streaming.com/k8s/tos/tears-of-steel-multi-lang.ism/tears-of-steel-multi-lang-audio_ita=64008.m3u8"',
        ),
      );
      expect('TYPE=AUDIO'.allMatches(out).length, 2);
    });

    test('drops I-frame tracks above the cap', () {
      final out = HlsManifest.capped(unifiedTos, base: tosBase, maxHeight: 480);
      expect(out, isNot(contains('I-FRAME')));
      expect(HlsManifest.heights(out), [350, 100]);
    });

    test('keeps the smallest rendition when nothing fits the cap', () {
      final out = HlsManifest.capped(muxBbb, base: muxBase, maxHeight: 100);
      expect(HlsManifest.heights(out), [184]);
    });

    test('normalises CRLF line endings', () {
      final out = HlsManifest.capped(unifiedTos, base: tosBase, maxHeight: 2160);
      expect(out, isNot(contains('\r')));
      expect(HlsManifest.heights(out), [750, 350, 100]);
    });
  });
}
