import 'dart:async';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:video_player/video_player.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

import '../../../core/storage/local_storage.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/validators.dart';
import '../../../core/widgets/content_cards.dart';
import '../../account/data/account_repository.dart';
import '../../auth/data/auth_repository.dart';
import '../../catalog/data/catalog_repository.dart';
import '../../catalog/domain/content.dart';
import '../../player/application/playback_resolver.dart';
import '../../player/presentation/player_controls.dart';
import '../data/live_repository.dart';
import '../domain/watch_party.dart';

class LiveRoomScreen extends ConsumerStatefulWidget {
  const LiveRoomScreen({super.key, required this.channelId});

  final String channelId;

  @override
  ConsumerState<LiveRoomScreen> createState() => _LiveRoomScreenState();
}

class _LiveRoomScreenState extends ConsumerState<LiveRoomScreen> {
  VideoPlayerController? _controller;
  LiveChannel? _channel;
  String? _error;
  Timer? _syncTimer;
  final _joinedAt = DateTime.now();
  final _reactions = GlobalKey<_FloatingReactionsState>();
  StreamSubscription<List<Reaction>>? _reactionSub;

  @override
  void initState() {
    super.initState();
    _start();
  }

  @override
  void dispose() {
    _syncTimer?.cancel();
    _reactionSub?.cancel();
    _controller?.dispose();
    WakelockPlus.disable();
    super.dispose();
  }

  Future<void> _start() async {
    try {
      final catalog = await ref.read(catalogProvider.future);
      final channel = catalog.liveById(widget.channelId);
      if (channel == null) throw Exception('This channel has ended.');
      _channel = channel;

      final playback = await PlaybackResolver.resolve(
        client: ref.read(httpClientProvider),
        url: channel.url,
        adaptive: true,
        maxHeight: ref.read(effectivePlanProvider).maxHeight,
        cacheKey: 'live-${channel.id}',
      );
      var controller = playback.controller();
      try {
        await controller.initialize();
      } catch (_) {
        if (playback.cappedManifest == null) rethrow;
        await controller.dispose();
        controller = playback.withoutCap().controller();
        await controller.initialize();
      }

      if (channel.kind == LiveKind.watchParty && channel.loop != null) {
        await controller.setLooping(true);
        await controller.seekTo(WatchParty.playhead(DateTime.now(), channel.loop!));
        _syncTimer = Timer.periodic(const Duration(seconds: 15), (_) => _resync());
      }
      await controller.play();
      WakelockPlus.enable();

      final me = ref.read(currentUserProvider)?.uid;
      _reactionSub = ref.read(liveRepositoryProvider).watchReactions(channel.id, _joinedAt).listen((batch) {
        for (final r in batch) {
          if (r.uid != me) _reactions.currentState?.spawn(r.emoji);
        }
      });

      if (mounted) setState(() => _controller = controller);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    }
  }

  /// Watch party: jump back onto the shared clock after a stall or pause.
  void _resync() {
    final c = _controller;
    final loop = _channel?.loop;
    if (c == null || loop == null || !c.value.isPlaying) return;
    final expected = WatchParty.playhead(DateTime.now(), loop);
    if (WatchParty.isDrifted(c.value.position, expected, loop)) c.seekTo(expected);
  }

  DateTime _lastReaction = DateTime.fromMillisecondsSinceEpoch(0);

  void _react(String emoji) {
    final now = DateTime.now();
    if (now.difference(_lastReaction) < const Duration(milliseconds: 250)) return;
    _lastReaction = now;
    _reactions.currentState?.spawn(emoji);
    final uid = ref.read(currentUserProvider)?.uid;
    final channel = _channel;
    if (uid != null && channel != null) {
      ref.read(liveRepositoryProvider).react(channel.id, uid: uid, emoji: emoji);
    }
  }

  @override
  Widget build(BuildContext context) {
    final channel = _channel;
    final size = MediaQuery.sizeOf(context);
    final landscapePhone = size.width > size.height && size.width < 840;
    final wide = size.width >= 840;

    final player = AspectRatio(
      aspectRatio: 16 / 9,
      child: Stack(
        fit: StackFit.expand,
        children: [
          if (_error != null)
            ColoredBox(
              color: Colors.black,
              child: Center(child: Text(_error!, textAlign: TextAlign.center)),
            )
          else if (_controller == null)
            const ColoredBox(
              color: Colors.black,
              child: Center(child: CircularProgressIndicator()),
            )
          else
            PlayerView(
              controller: _controller!,
              title: channel!.title,
              subtitle: channel.credit,
              compact: !landscapePhone,
              liveLabel: switch (channel.kind) {
                LiveKind.watchParty => 'WATCH PARTY · IN SYNC',
                LiveKind.studio => 'STUDIO LIVE',
                LiveKind.live => 'LIVE',
              },
              onBack: () => context.canPop() ? context.pop() : context.go('/live'),
            ),
          Positioned(right: 0, bottom: 0, width: 90, height: 260, child: _FloatingReactions(key: _reactions)),
        ],
      ),
    );

    if (landscapePhone) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: player),
      );
    }

    final chat = channel == null ? const SizedBox.shrink() : _ChatPanel(channel: channel, onReact: _react);

    return Scaffold(
      body: SafeArea(
        child: wide
            ? Row(
                children: [
                  Expanded(child: Center(child: player)),
                  const VerticalDivider(width: 1),
                  SizedBox(width: 380, child: chat),
                ],
              )
            : Column(
                children: [
                  player,
                  Expanded(child: chat),
                ],
              ),
      ),
    );
  }
}

class _ChatPanel extends ConsumerStatefulWidget {
  const _ChatPanel({required this.channel, required this.onReact});

  final LiveChannel channel;
  final void Function(String emoji) onReact;

  @override
  ConsumerState<_ChatPanel> createState() => _ChatPanelState();
}

class _ChatPanelState extends ConsumerState<_ChatPanel> {
  final _input = TextEditingController();
  String? _error;
  DateTime _lastSent = DateTime.fromMillisecondsSinceEpoch(0);
  static const _slowMode = Duration(seconds: 2);

  @override
  void dispose() {
    _input.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    final error = Validators.chatMessage(_input.text, max: ChatMessage.maxLength);
    if (error != null) return setState(() => _error = error);
    if (DateTime.now().difference(_lastSent) < _slowMode) {
      return setState(() => _error = 'Slow mode is on: one message every ${_slowMode.inSeconds}s');
    }
    final me = ref.read(currentUserProvider);
    if (me == null) return;
    final text = _input.text.trim();
    _input.clear();
    setState(() => _error = null);
    _lastSent = DateTime.now();
    try {
      await ref
          .read(liveRepositoryProvider)
          .sendChat(widget.channel.id, uid: me.uid, author: me.displayName, text: text);
    } catch (e) {
      if (mounted) setState(() => _error = "Couldn't send: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    final messages = ref.watch(chatProvider(widget.channel.id));
    final me = ref.watch(currentUserProvider)?.uid;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: Text('Live chat', style: Theme.of(context).textTheme.titleMedium),
        ),
        Expanded(
          child: messages.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => ErrorView(error: e),
            data: (list) => list.isEmpty
                ? const EmptyState(
                    icon: Icons.forum_outlined,
                    title: 'Say hi 👋',
                    message: 'Messages appear on every device watching, in real time.',
                  )
                : ListView.builder(
                    reverse: true,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemCount: list.length,
                    itemBuilder: (context, i) => _ChatBubble(message: list[i], mine: list[i].uid == me),
                  ),
          ),
        ),
        SizedBox(
          height: 48,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 10),
            children: [
              for (final e in Reaction.allowed)
                IconButton(
                  tooltip: 'React $e',
                  onPressed: () => widget.onReact(e),
                  icon: Text(e, style: const TextStyle(fontSize: 24)),
                ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 4, 12, 12),
          child: TextField(
            controller: _input,
            maxLength: ChatMessage.maxLength,
            textInputAction: TextInputAction.send,
            onSubmitted: (_) => _send(),
            onChanged: (_) {
              if (_error != null) setState(() => _error = null);
            },
            decoration: InputDecoration(
              hintText: 'Chat with everyone watching…',
              counterText: '',
              errorText: _error,
              suffixIcon: IconButton(
                tooltip: 'Send',
                onPressed: _send,
                icon: const Icon(Icons.send_rounded, color: AppColors.primary),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _ChatBubble extends StatelessWidget {
  const _ChatBubble({required this.message, required this.mine});

  final ChatMessage message;
  final bool mine;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 4),
    child: Text.rich(
      TextSpan(
        children: [
          TextSpan(
            text: '${message.author}  ',
            style: TextStyle(fontWeight: FontWeight.w800, color: mine ? AppColors.primary : AppColors.teal),
          ),
          TextSpan(text: message.text),
          TextSpan(
            text: '  ${formatAgo(message.sentAt)}',
            style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
          ),
        ],
      ),
    ),
  );
}

/// Emojis that float up and fade: yours right away, everyone else's as
/// Firestore delivers them.
class _FloatingReactions extends StatefulWidget {
  const _FloatingReactions({super.key});

  @override
  State<_FloatingReactions> createState() => _FloatingReactionsState();
}

class _FloatingReactionsState extends State<_FloatingReactions> {
  final _items = <(int, String, double)>[];
  final _rng = Random();
  int _seq = 0;

  void spawn(String emoji) {
    if (!mounted || _items.length > 30) return;
    setState(() => _items.add((_seq++, emoji, _rng.nextDouble())));
  }

  @override
  Widget build(BuildContext context) => IgnorePointer(
    child: Stack(
      clipBehavior: Clip.none,
      children: [
        for (final (id, emoji, seed) in _items)
          TweenAnimationBuilder<double>(
            key: ValueKey(id),
            tween: Tween(begin: 0, end: 1),
            duration: Duration(milliseconds: 1800 + (seed * 700).round()),
            curve: Curves.easeOut,
            onEnd: () => setState(() => _items.removeWhere((e) => e.$1 == id)),
            builder: (context, t, child) => Positioned(
              bottom: 10 + t * 220,
              right: 20 + sin((t * 3 + seed) * pi) * 18,
              child: Opacity(
                opacity: (1 - t).clamp(0, 1),
                child: Transform.scale(scale: 0.8 + t * 0.6, child: child),
              ),
            ),
            child: Text(emoji, style: const TextStyle(fontSize: 28)),
          ),
      ],
    ),
  );
}
