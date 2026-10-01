import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_theme.dart';
import '../../../core/utils/validators.dart';
import '../../../core/widgets/brand.dart';
import '../../../core/widgets/content_cards.dart';
import '../data/auth_repository.dart';

class SignInScreen extends ConsumerStatefulWidget {
  const SignInScreen({super.key});

  @override
  ConsumerState<SignInScreen> createState() => _SignInScreenState();
}

class _SignInScreenState extends ConsumerState<SignInScreen> {
  final _form = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  bool _creating = false;
  bool _obscure = true;
  bool _busy = false;
  String? _error;

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    if (!_form.currentState!.validate()) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    final auth = ref.read(authRepositoryProvider);
    try {
      if (_creating) {
        await auth.signUp(name: _name.text, email: _email.text, password: _password.text);
      } else {
        await auth.signIn(email: _email.text, password: _password.text);
      }
      // The router redirects to Home once the auth state changes.
    } on AuthFailure catch (e) {
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _forgotPassword() async {
    final emailError = Validators.email(_email.text);
    if (emailError != null) {
      setState(() => _error = 'Enter your email above first, then tap "Forgot password?" again.');
      return;
    }
    try {
      await ref.read(authRepositoryProvider).sendPasswordReset(_email.text);
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text('Password reset link sent to ${_email.text.trim()}')));
    } on AuthFailure catch (e) {
      setState(() => _error = e.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Scaffold(
      body: Stack(
        children: [
          const Positioned.fill(child: _PosterWall()),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: Form(
                    key: _form,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const SizedBox(height: 120),
                        const Center(child: BrandMark(size: 28)),
                        const SizedBox(height: 8),
                        Text(
                          Brand.tagline,
                          textAlign: TextAlign.center,
                          style: text.bodyMedium?.copyWith(color: AppColors.textMuted),
                        ),
                        const SizedBox(height: 28),
                        SegmentedButton<bool>(
                          segments: const [
                            ButtonSegment(value: false, label: Text('Sign in')),
                            ButtonSegment(value: true, label: Text('Create account')),
                          ],
                          selected: {_creating},
                          showSelectedIcon: false,
                          onSelectionChanged: (v) => setState(() {
                            _creating = v.first;
                            _error = null;
                          }),
                        ),
                        const SizedBox(height: 20),
                        AnimatedSize(
                          duration: const Duration(milliseconds: 200),
                          child: _creating
                              ? Padding(
                                  padding: const EdgeInsets.only(bottom: 14),
                                  child: TextFormField(
                                    controller: _name,
                                    textCapitalization: TextCapitalization.words,
                                    textInputAction: TextInputAction.next,
                                    autofillHints: const [AutofillHints.name],
                                    decoration: const InputDecoration(
                                      labelText: 'Your name',
                                      prefixIcon: Icon(Icons.badge_outlined),
                                    ),
                                    validator: Validators.displayName,
                                  ),
                                )
                              : const SizedBox(width: double.infinity),
                        ),
                        TextFormField(
                          controller: _email,
                          keyboardType: TextInputType.emailAddress,
                          textInputAction: TextInputAction.next,
                          autofillHints: const [AutofillHints.email],
                          autocorrect: false,
                          decoration: const InputDecoration(
                            labelText: 'Email',
                            prefixIcon: Icon(Icons.alternate_email_rounded),
                          ),
                          validator: Validators.email,
                        ),
                        const SizedBox(height: 14),
                        TextFormField(
                          controller: _password,
                          obscureText: _obscure,
                          textInputAction: TextInputAction.done,
                          autofillHints: [_creating ? AutofillHints.newPassword : AutofillHints.password],
                          onFieldSubmitted: (_) => _submit(),
                          decoration: InputDecoration(
                            labelText: 'Password',
                            helperText: _creating ? 'At least 8 characters, with letters and numbers' : null,
                            prefixIcon: const Icon(Icons.lock_outline_rounded),
                            suffixIcon: IconButton(
                              tooltip: _obscure ? 'Show password' : 'Hide password',
                              icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                              onPressed: () => setState(() => _obscure = !_obscure),
                            ),
                          ),
                          validator: _creating ? Validators.password : Validators.signInPassword,
                        ),
                        if (!_creating)
                          Align(
                            alignment: Alignment.centerRight,
                            child: TextButton(
                              onPressed: _busy ? null : _forgotPassword,
                              child: const Text('Forgot password?'),
                            ),
                          ),
                        if (_error != null) ...[const SizedBox(height: 8), _ErrorBanner(_error!)],
                        const SizedBox(height: 16),
                        FilledButton(
                          onPressed: _busy ? null : _submit,
                          child: _busy
                              ? const SizedBox(
                                  width: 22,
                                  height: 22,
                                  child: CircularProgressIndicator(strokeWidth: 2.4),
                                )
                              : Text(_creating ? 'Create account' : 'Sign in'),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'All films are openly licensed. See each title for credits.',
                          textAlign: TextAlign.center,
                          style: text.bodySmall,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner(this.message);

  final String message;

  @override
  Widget build(BuildContext context) => Semantics(
    liveRegion: true,
    child: Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.live.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.live.withValues(alpha: 0.4)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline_rounded, color: AppColors.live, size: 20),
          const SizedBox(width: 10),
          Expanded(child: Text(message)),
        ],
      ),
    ),
  );
}

/// A wall of the catalogue's posters, fading into the background.
class _PosterWall extends StatelessWidget {
  const _PosterWall();

  static const _posters = [
    'assets/images/tears_of_steel_poster.jpg',
    'assets/images/sintel_poster.jpg',
    'assets/images/big_buck_bunny_poster.jpg',
    'assets/images/elephants_dream_poster.jpg',
    'assets/images/natgeo_4k_poster.jpg',
  ];

  @override
  Widget build(BuildContext context) => ExcludeSemantics(
    child: ShaderMask(
      blendMode: BlendMode.dstIn,
      shaderCallback: (rect) => const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        stops: [0, 0.45],
        colors: [Color(0x80FFFFFF), Colors.transparent],
      ).createShader(rect),
      child: GridView.count(
        crossAxisCount: 4,
        physics: const NeverScrollableScrollPhysics(),
        childAspectRatio: 2 / 3,
        mainAxisSpacing: 6,
        crossAxisSpacing: 6,
        children: [for (var i = 0; i < 12; i++) Artwork(_posters[(i * 3) % _posters.length])],
      ),
    ),
  );
}
