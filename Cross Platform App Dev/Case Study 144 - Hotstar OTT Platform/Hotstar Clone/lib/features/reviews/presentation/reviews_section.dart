import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/validators.dart';
import '../../auth/data/auth_repository.dart';
import '../data/reviews_repository.dart';

class ReviewsSection extends ConsumerStatefulWidget {
  const ReviewsSection({super.key, required this.contentId, required this.title});

  final String contentId;
  final String title;

  @override
  ConsumerState<ReviewsSection> createState() => _ReviewsSectionState();
}

class _ReviewsSectionState extends ConsumerState<ReviewsSection> {
  bool _showAll = false;

  @override
  Widget build(BuildContext context) {
    final reviews = ref.watch(reviewsProvider(widget.contentId));
    final me = ref.watch(currentUserProvider);

    return reviews.when(
      loading: () => const Padding(
        padding: EdgeInsets.all(24),
        child: Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Text("Couldn't load reviews: $e", style: const TextStyle(color: AppColors.textMuted)),
      ),
      data: (list) {
        final mine = list.where((r) => r.uid == me?.uid).firstOrNull;
        final avg = list.isEmpty ? 0.0 : list.map((r) => r.stars).reduce((a, b) => a + b) / list.length;
        final visible = _showAll ? list : list.take(3).toList();

        return Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  if (list.isNotEmpty) ...[
                    Text(avg.toStringAsFixed(1), style: Theme.of(context).textTheme.headlineMedium),
                    const SizedBox(width: 8),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        StarRow(stars: avg.round()),
                        Text(
                          '${list.length} ${list.length == 1 ? 'review' : 'reviews'}',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                        ),
                      ],
                    ),
                  ] else
                    const Expanded(
                      child: Text('No reviews yet. Be the first.', style: TextStyle(color: AppColors.textMuted)),
                    ),
                  if (list.isNotEmpty) const Spacer(),
                  OutlinedButton.icon(
                    onPressed: me == null
                        ? null
                        : () => showReviewSheet(
                            context,
                            contentId: widget.contentId,
                            title: widget.title,
                            existing: mine,
                          ),
                    icon: Icon(mine == null ? Icons.rate_review_outlined : Icons.edit_outlined, size: 18),
                    label: Text(mine == null ? 'Write a review' : 'Edit review'),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              for (final r in visible) ReviewTile(review: r, isMine: r.uid == me?.uid),
              if (list.length > 3)
                TextButton(
                  onPressed: () => setState(() => _showAll = !_showAll),
                  child: Text(_showAll ? 'Show fewer' : 'Show all ${list.length} reviews'),
                ),
            ],
          ),
        );
      },
    );
  }
}

class StarRow extends StatelessWidget {
  const StarRow({super.key, required this.stars, this.size = 14});

  final int stars;
  final double size;

  @override
  Widget build(BuildContext context) => Semantics(
    label: '$stars out of 5 stars',
    child: ExcludeSemantics(
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (var i = 1; i <= 5; i++)
            Icon(
              i <= stars ? Icons.star_rounded : Icons.star_outline_rounded,
              size: size,
              color: i <= stars ? AppColors.gold : Colors.white30,
            ),
        ],
      ),
    ),
  );
}

class ReviewTile extends StatefulWidget {
  const ReviewTile({super.key, required this.review, this.isMine = false});

  final Review review;
  final bool isMine;

  @override
  State<ReviewTile> createState() => _ReviewTileState();
}

class _ReviewTileState extends State<ReviewTile> {
  bool _revealed = false;

  @override
  Widget build(BuildContext context) {
    final r = widget.review;
    final hidden = r.spoiler && !_revealed && !widget.isMine;

    final body = Text(r.text, style: const TextStyle(height: 1.45));

    return Container(
      margin: const EdgeInsets.only(top: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surfaceHigh,
        borderRadius: BorderRadius.circular(14),
        border: widget.isMine ? Border.all(color: AppColors.primary.withValues(alpha: 0.5)) : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 14,
                backgroundColor: AppColors.surfaceHighest,
                child: Text(
                  r.author.isEmpty ? '?' : r.author[0].toUpperCase(),
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  widget.isMine ? '${r.author} (you)' : r.author,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              StarRow(stars: r.stars),
              const SizedBox(width: 8),
              Text(formatAgo(r.createdAt), style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
            ],
          ),
          const SizedBox(height: 10),
          if (r.spoiler)
            Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                children: [
                  const Icon(Icons.warning_amber_rounded, size: 14, color: AppColors.gold),
                  const SizedBox(width: 4),
                  const Text(
                    'Contains spoilers',
                    style: TextStyle(color: AppColors.gold, fontSize: 12, fontWeight: FontWeight.w700),
                  ),
                  const Spacer(),
                  if (_revealed)
                    GestureDetector(
                      onTap: () => setState(() => _revealed = false),
                      child: const Text('Hide', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                    ),
                ],
              ),
            ),
          if (hidden)
            Semantics(
              button: true,
              label: 'Spoiler hidden. Double tap to reveal.',
              child: GestureDetector(
                onTap: () => setState(() => _revealed = true),
                child: ExcludeSemantics(
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      ImageFiltered(imageFilter: ImageFilter.blur(sigmaX: 7, sigmaY: 7), child: body),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceHighest,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text('Tap to reveal', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12)),
                      ),
                    ],
                  ),
                ),
              ),
            )
          else
            body,
        ],
      ),
    );
  }
}

Future<void> showReviewSheet(
  BuildContext context, {
  required String contentId,
  required String title,
  Review? existing,
}) => showModalBottomSheet<void>(
  context: context,
  isScrollControlled: true,
  builder: (_) => _ReviewForm(contentId: contentId, title: title, existing: existing),
);

class _ReviewForm extends ConsumerStatefulWidget {
  const _ReviewForm({required this.contentId, required this.title, this.existing});

  final String contentId;
  final String title;
  final Review? existing;

  @override
  ConsumerState<_ReviewForm> createState() => _ReviewFormState();
}

class _ReviewFormState extends ConsumerState<_ReviewForm> {
  final _form = GlobalKey<FormState>();
  late final _text = TextEditingController(text: widget.existing?.text);
  late int _stars = widget.existing?.stars ?? 0;
  late bool _spoiler = widget.existing?.spoiler ?? false;
  bool _busy = false;

  @override
  void dispose() {
    _text.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_form.currentState!.validate()) return;
    final me = ref.read(currentUserProvider)!;
    setState(() => _busy = true);
    try {
      await ref
          .read(reviewsRepositoryProvider)
          .upsert(
            widget.contentId,
            Review(
              uid: me.uid,
              author: me.displayName,
              stars: _stars,
              text: _text.text.trim(),
              spoiler: _spoiler,
              createdAt: DateTime.now(),
            ),
          );
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      if (!mounted) return;
      setState(() => _busy = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Couldn't save: $e")));
    }
  }

  Future<void> _delete() async {
    final me = ref.read(currentUserProvider)!;
    await ref.read(reviewsRepositoryProvider).delete(widget.contentId, me.uid);
    if (mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(20, 0, 20, MediaQuery.viewInsetsOf(context).bottom + 20),
      child: Form(
        key: _form,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Review ${widget.title}', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            FormField<int>(
              initialValue: _stars,
              validator: (_) => _stars == 0 ? 'Tap a star to rate' : null,
              builder: (field) => Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      for (var i = 1; i <= 5; i++)
                        IconButton(
                          tooltip: '$i ${i == 1 ? 'star' : 'stars'}',
                          iconSize: 34,
                          onPressed: () {
                            setState(() => _stars = i);
                            field.didChange(i);
                          },
                          icon: Icon(
                            i <= _stars ? Icons.star_rounded : Icons.star_outline_rounded,
                            color: i <= _stars ? AppColors.gold : Colors.white38,
                          ),
                        ),
                    ],
                  ),
                  if (field.hasError)
                    Padding(
                      padding: const EdgeInsets.only(left: 12),
                      child: Text(field.errorText!, style: const TextStyle(color: AppColors.live, fontSize: 12)),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _text,
              minLines: 3,
              maxLines: 6,
              maxLength: Review.maxLength,
              textCapitalization: TextCapitalization.sentences,
              decoration: const InputDecoration(
                labelText: 'Your review',
                alignLabelWithHint: true,
                hintText: 'What worked, what didn’t?',
              ),
              validator: (v) => Validators.reviewText(v, min: Review.minLength, max: Review.maxLength),
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              value: _spoiler,
              onChanged: (v) => setState(() => _spoiler = v),
              title: const Text('Contains spoilers'),
              subtitle: const Text('Others will see it blurred until they tap it'),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                if (widget.existing != null)
                  TextButton.icon(
                    onPressed: _busy ? null : _delete,
                    icon: const Icon(Icons.delete_outline_rounded),
                    label: const Text('Delete'),
                    style: TextButton.styleFrom(foregroundColor: AppColors.live),
                  ),
                const Spacer(),
                FilledButton(
                  onPressed: _busy ? null : _save,
                  child: Text(widget.existing == null ? 'Post review' : 'Save changes'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
