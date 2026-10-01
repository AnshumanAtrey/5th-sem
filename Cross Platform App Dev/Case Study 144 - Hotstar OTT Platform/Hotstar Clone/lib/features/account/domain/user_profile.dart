import '../../parental/domain/parental_settings.dart';
import '../../subscription/domain/plan.dart';

class UserProfile {
  const UserProfile({
    required this.uid,
    required this.displayName,
    required this.email,
    this.plan = Plan.free,
    this.familyEmails = const [],
    this.parental = const ParentalSettings(),
  });

  final String uid;
  final String displayName;
  final String email;
  final Plan plan;

  /// Premium owners can share their plan with up to [Plan.familyLimit] emails.
  final List<String> familyEmails;
  final ParentalSettings parental;

  factory UserProfile.fromMap(String uid, Map<String, dynamic> map) => UserProfile(
    uid: uid,
    displayName: map['displayName'] as String? ?? 'Viewer',
    email: map['email'] as String? ?? '',
    plan: Plan.parse(map['plan'] as String?),
    familyEmails: List<String>.from(map['familyEmails'] as List? ?? const []),
    parental: ParentalSettings.fromMap(map['parental'] as Map<String, dynamic>?),
  );
}
