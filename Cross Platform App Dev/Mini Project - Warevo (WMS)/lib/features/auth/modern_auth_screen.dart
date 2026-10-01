import 'package:flutter/material.dart';
import '../../core/theme/ledger_theme.dart';
import '../../state/app_state.dart';

class ModernAuthScreen extends StatefulWidget {
  final AppState appState;
  final VoidCallback onLoginSuccess;

  const ModernAuthScreen({
    super.key,
    required this.appState,
    required this.onLoginSuccess,
  });

  @override
  State<ModernAuthScreen> createState() => _ModernAuthScreenState();
}

class _ModernAuthScreenState extends State<ModernAuthScreen> {
  int _authTab = 0; // 0: Sign In, 1: Create Org, 2: 6-Digit Code
  bool _obscurePassword = true;
  bool _rememberMe = true;
  bool _isLoading = false;

  final _nameController = TextEditingController(text: 'Aarav Shah');
  final _orgController = TextEditingController(text: 'Ashva Apparel');
  final _emailController = TextEditingController(text: 'aarav@ashva.in');
  final _passwordController = TextEditingController(text: 'password123');
  final _codeController = TextEditingController(text: 'ST8821');

  @override
  void dispose() {
    _nameController.dispose();
    _orgController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _codeController.dispose();
    super.dispose();
  }

  void _submitAuth() async {
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 500));
    if (!mounted) return;
    setState(() => _isLoading = false);

    if (_authTab == 2) {
      widget.appState.switchRole(UserRole.store);
    } else {
      widget.appState.switchRole(UserRole.owner);
    }
    widget.onLoginSuccess();
  }

  void _quickFill(String email, UserRole role, String name) {
    setState(() {
      _emailController.text = email;
      _passwordController.text = 'pass1234';
      _authTab = 0;
    });
    widget.appState.switchRole(role);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: const Color(0xFF0F1117),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        content: Row(
          children: [
            const Icon(Icons.bolt, color: Color(0xFFFFAE19), size: 18),
            const SizedBox(width: 8),
            Text('Signed in as $name', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
    widget.onLoginSuccess();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FC),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 420),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Prominent Centered Logo & Branding
                  Center(
                    child: Column(
                      children: [
                        // Animated / Glowing Squircle Logo
                        Container(
                          width: 76,
                          height: 76,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [
                                Color(0xFF1E222D),
                                Color(0xFF0D0F14),
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(22),
                            border: Border.all(
                              color: const Color(0xFF3B4261),
                              width: 1.5,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.18),
                                blurRadius: 24,
                                offset: const Offset(0, 10),
                              ),
                              BoxShadow(
                                color: const Color(0xFFFFAE19).withValues(alpha: 0.15),
                                blurRadius: 30,
                                spreadRadius: 2,
                              ),
                            ],
                          ),
                          child: Center(
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 12,
                                  height: 34,
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(3),
                                  ),
                                ),
                                const SizedBox(width: 5),
                                Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Container(
                                      width: 12,
                                      height: 14,
                                      decoration: BoxDecoration(
                                        color: Colors.white.withValues(alpha: 0.7),
                                        borderRadius: BorderRadius.circular(3),
                                      ),
                                    ),
                                    const SizedBox(height: 5),
                                    Container(
                                      width: 12,
                                      height: 14,
                                      decoration: BoxDecoration(
                                        gradient: const LinearGradient(
                                          colors: [Color(0xFFFFAE19), Color(0xFFF59E0B)],
                                        ),
                                        borderRadius: BorderRadius.circular(3),
                                        boxShadow: [
                                          BoxShadow(
                                            color: const Color(0xFFFFAE19).withValues(alpha: 0.5),
                                            blurRadius: 6,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'LEDGER',
                          style: TextStyle(
                            fontFamily: LedgerTypography.fontMono,
                            fontSize: 26,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 1.5,
                            color: const Color(0xFF0F1117),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Know where every unit is.',
                          style: TextStyle(
                            fontFamily: LedgerTypography.fontSans,
                            fontSize: 14,
                            color: Colors.black54,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFF12994F).withValues(alpha: 0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.fiber_manual_record, size: 8, color: Color(0xFF12994F)),
                              SizedBox(width: 5),
                              Text(
                                'Omnichannel Engine · 41 Stores Synced',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF12994F),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 28),

                  // Interactive Segmented Tab Selector
                  Container(
                    height: 46,
                    padding: const EdgeInsets.all(3.5),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEBEFF5),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Row(
                      children: [
                        _buildTabButton('Sign In', 0),
                        _buildTabButton('Create Org', 1),
                        _buildTabButton('Staff Code', 2),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Main Form Container
                  Container(
                    padding: const EdgeInsets.all(22),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(22),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.04),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        if (_authTab == 0) _buildSignInForm(),
                        if (_authTab == 1) _buildCreateOrgForm(),
                        if (_authTab == 2) _buildCodeJoinForm(),

                        const SizedBox(height: 18),

                        // Action Button
                        ElevatedButton(
                          onPressed: _isLoading ? null : _submitAuth,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF0F1117),
                            foregroundColor: Colors.white,
                            elevation: 0,
                            minimumSize: const Size(double.infinity, 50),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                                )
                              : Text(
                                  _authTab == 0
                                      ? 'Sign In to Workspace'
                                      : (_authTab == 1 ? 'Create Organisation & Bins' : 'Join Store Shift'),
                                  style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700),
                                ),
                        ),

                        if (_authTab == 0) ...[
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              const Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 10),
                                child: Text('or', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                              ),
                              const Expanded(child: Divider(color: Color(0xFFE2E8F0))),
                            ],
                          ),
                          const SizedBox(height: 14),
                          OutlinedButton.icon(
                            onPressed: _submitAuth,
                            style: OutlinedButton.styleFrom(
                              minimumSize: const Size(double.infinity, 48),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              side: const BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                            icon: const Icon(Icons.g_mobiledata, size: 24, color: Colors.black87),
                            label: const Text(
                              'Continue with Google Workspace',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.black87),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 22),

                  // 1-Tap Quick Demo Profiles
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.flash_on, size: 15, color: Color(0xFFFFAE19)),
                            const SizedBox(width: 6),
                            const Text(
                              'INSTANT 1-TAP DEMO ACCESS',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.5,
                                color: Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            _buildDemoCard('Aarav (Owner / HQ)', 'aarav@ashva.in', UserRole.owner, Icons.admin_panel_settings_outlined),
                            _buildDemoCard('Ravi (Picker / Floor)', 'ravi@ashva.in', UserRole.floor, Icons.qr_code_scanner),
                            _buildDemoCard('Meena (Warehouse Mgr)', 'meena@ashva.in', UserRole.manager, Icons.warehouse_outlined),
                            _buildDemoCard('Priya (Store Manager)', 'priya@ashva.in', UserRole.store, Icons.storefront_outlined),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTabButton(String title, int tabIndex) {
    final bool isSelected = _authTab == tabIndex;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _authTab = tabIndex),
        child: Container(
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(11),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.06),
                      blurRadius: 4,
                    ),
                  ]
                : null,
          ),
          alignment: Alignment.center,
          child: Text(
            title,
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              color: isSelected ? const Color(0xFF0F1117) : const Color(0xFF64748B),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSignInForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildInputField('Work Email', _emailController, 'name@company.com', Icons.mail_outline),
        const SizedBox(height: 14),
        _buildInputField(
          'Password',
          _passwordController,
          '••••••••',
          Icons.lock_outline,
          obscureText: _obscurePassword,
          suffix: IconButton(
            icon: Icon(
              _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
              size: 18,
              color: Colors.grey,
            ),
            onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
          ),
        ),
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                SizedBox(
                  width: 22,
                  height: 22,
                  child: Checkbox(
                    value: _rememberMe,
                    activeColor: const Color(0xFF0F1117),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                    onChanged: (v) => setState(() => _rememberMe = v ?? true),
                  ),
                ),
                const SizedBox(width: 8),
                const Text('Remember me', style: TextStyle(fontSize: 12, color: Colors.black87)),
              ],
            ),
            GestureDetector(
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Password reset instructions dispatched to your email.')),
                );
              },
              child: const Text(
                'Forgot password?',
                style: TextStyle(fontSize: 12, color: Color(0xFF2563EB), fontWeight: FontWeight.w600),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCreateOrgForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildInputField('Your Name', _nameController, 'Aarav Shah', Icons.person_outline),
        const SizedBox(height: 12),
        _buildInputField('Organisation / Brand', _orgController, 'Ashva Apparel', Icons.business_outlined),
        const SizedBox(height: 12),
        _buildInputField('Work Email', _emailController, 'founder@brand.com', Icons.mail_outline),
        const SizedBox(height: 12),
        _buildInputField('Create Password', _passwordController, '••••••••', Icons.lock_outline, obscureText: true),
      ],
    );
  }

  Widget _buildCodeJoinForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Join Store or Warehouse Shift',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        const Text(
          'Enter the 6-character code given by your manager.',
          style: TextStyle(fontSize: 11.5, color: Colors.grey),
        ),
        const SizedBox(height: 14),
        TextField(
          controller: _codeController,
          style: TextStyle(
            fontFamily: LedgerTypography.fontMono,
            fontSize: 22,
            letterSpacing: 6,
            fontWeight: FontWeight.bold,
          ),
          textAlign: TextAlign.center,
          decoration: InputDecoration(
            hintText: 'ST8821',
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            contentPadding: const EdgeInsets.symmetric(vertical: 14),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Row(
            children: [
              Icon(Icons.storefront, size: 16, color: Color(0xFF0F1117)),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Matched: Phoenix Palassio, Lucknow · Store Associate',
                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildInputField(
    String label,
    TextEditingController controller,
    String hint,
    IconData icon, {
    bool obscureText = false,
    Widget? suffix,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF334155))),
        const SizedBox(height: 5),
        TextField(
          controller: controller,
          obscureText: obscureText,
          style: const TextStyle(fontSize: 13.5),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Colors.black38, fontSize: 13),
            prefixIcon: Icon(icon, size: 18, color: const Color(0xFF64748B)),
            suffixIcon: suffix,
            filled: true,
            fillColor: const Color(0xFFF8FAFC),
            contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF0F1117), width: 1.5),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDemoCard(String title, String email, UserRole role, IconData icon) {
    return InkWell(
      onTap: () => _quickFill(email, role, title),
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: const Color(0xFF0F1117)),
            const SizedBox(width: 6),
            Text(
              title,
              style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: Color(0xFF0F1117)),
            ),
          ],
        ),
      ),
    );
  }
}
