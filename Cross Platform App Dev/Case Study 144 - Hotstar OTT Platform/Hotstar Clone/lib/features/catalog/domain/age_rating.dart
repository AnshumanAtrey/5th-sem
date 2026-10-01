/// Age classes from India's IT Rules 2021 (the Digital Media Ethics Code
/// that OTT platforms self-classify under).
enum AgeRating {
  u('U', 0, 'Suitable for all ages'),
  ua7('U/A 7+', 7, 'Suitable for ages 7 and up; younger children with parental guidance'),
  ua13('U/A 13+', 13, 'Suitable for ages 13 and up; younger viewers with parental guidance'),
  ua16('U/A 16+', 16, 'Suitable for ages 16 and up; younger viewers with parental guidance'),
  a('A', 18, 'Adults only');

  const AgeRating(this.label, this.minAge, this.description);

  final String label;
  final int minAge;
  final String description;

  bool isAbove(AgeRating other) => minAge > other.minAge;

  static AgeRating parse(String value) =>
      AgeRating.values.firstWhere((r) => r.name == value, orElse: () => AgeRating.a);
}
