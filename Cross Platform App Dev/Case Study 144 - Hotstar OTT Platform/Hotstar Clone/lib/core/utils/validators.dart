/// Form validators. Each returns null when the value is fine, or an error
/// message to show under the field.
abstract final class Validators {
  static final _email = RegExp(r'^[\w.+-]+@[\w-]+(\.[\w-]+)+$');

  static String? email(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Enter your email';
    if (!_email.hasMatch(v)) return 'Enter a valid email, like name@example.com';
    return null;
  }

  static String? password(String? value) {
    final v = value ?? '';
    if (v.isEmpty) return 'Enter a password';
    if (v.length < 8) return 'Use at least 8 characters';
    if (!RegExp(r'[A-Za-z]').hasMatch(v) || !RegExp(r'\d').hasMatch(v)) {
      return 'Use both letters and numbers';
    }
    return null;
  }

  static String? signInPassword(String? value) => (value == null || value.isEmpty) ? 'Enter your password' : null;

  static String? displayName(String? value) {
    final v = value?.trim() ?? '';
    if (v.length < 2) return 'Enter at least 2 characters';
    if (v.length > 40) return 'Keep it under 40 characters';
    return null;
  }

  static String? reviewText(String? value, {required int min, required int max}) {
    final v = value?.trim() ?? '';
    if (v.length < min) return 'Write at least $min characters';
    if (v.length > max) return 'Keep it under $max characters';
    return null;
  }

  static String? chatMessage(String? value, {required int max}) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'Type a message';
    if (v.length > max) return 'Max $max characters';
    return null;
  }
}
