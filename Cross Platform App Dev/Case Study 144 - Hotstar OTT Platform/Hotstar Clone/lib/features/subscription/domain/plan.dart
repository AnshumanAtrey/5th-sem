/// The four tiers from the case study. The order matters: a higher index
/// means a higher tier, and each tier includes everything below it.
enum Plan {
  free(
    id: 'free',
    label: 'Free',
    pricePerYear: 0,
    maxHeight: 480,
    showsAds: true,
    allowsDownloads: false,
    allowsLargeScreens: false,
    screens: 1,
    benefits: ['Selected titles free', 'Up to 480p', 'Ad-supported'],
  ),
  mobile(
    id: 'mobile',
    label: 'Mobile',
    pricePerYear: 499,
    maxHeight: 720,
    showsAds: false,
    allowsDownloads: true,
    allowsLargeScreens: false,
    screens: 1,
    benefits: ['All movies & live', 'Up to 720p', 'Ad-free', 'Downloads', 'Phones only'],
  ),
  superPlan(
    id: 'super',
    label: 'Super',
    pricePerYear: 899,
    maxHeight: 1080,
    showsAds: false,
    allowsDownloads: true,
    allowsLargeScreens: true,
    screens: 2,
    benefits: ['Everything in Mobile', 'Full HD 1080p', 'Mobile + TV + tablet', '2 screens'],
  ),
  premium(
    id: 'premium',
    label: 'Premium',
    pricePerYear: 1499,
    maxHeight: 2160,
    showsAds: false,
    allowsDownloads: true,
    allowsLargeScreens: true,
    screens: 4,
    familySharing: true,
    benefits: ['Everything in Super', '4K 2160p', '4 screens', 'Family sharing (up to 3 members)'],
  );

  const Plan({
    required this.id,
    required this.label,
    required this.pricePerYear,
    required this.maxHeight,
    required this.showsAds,
    required this.allowsDownloads,
    required this.allowsLargeScreens,
    required this.screens,
    required this.benefits,
    this.familySharing = false,
  });

  /// Stored in JSON and Firestore. Kept separate from the Dart name,
  /// because `super` is a reserved word and can't be an enum value.
  final String id;
  final String label;
  final int pricePerYear;
  final int maxHeight;
  final bool showsAds;
  final bool allowsDownloads;
  final bool allowsLargeScreens;
  final int screens;
  final bool familySharing;
  final List<String> benefits;

  static const familyLimit = 3;

  bool includes(Plan other) => index >= other.index;

  String get priceLabel => pricePerYear == 0 ? 'Free' : '₹$pricePerYear/year';

  String get qualityLabel => maxHeight >= 2160 ? '4K' : '${maxHeight}p';

  static Plan parse(String? value) => Plan.values.firstWhere((p) => p.id == value, orElse: () => Plan.free);
}
