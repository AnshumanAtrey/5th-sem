import 'plan.dart';

/// Phones vs. everything with a big screen (tablets, Android TV). The
/// Mobile plan is limited to phones.
enum DeviceClass {
  phone,
  largeScreen;

  /// Material's compact/medium breakpoint: 600dp on the shortest side.
  static DeviceClass fromShortestSide(double shortestSide) =>
      shortestSide >= 600 ? DeviceClass.largeScreen : DeviceClass.phone;
}

sealed class Access {
  const Access();
}

class Allowed extends Access {
  const Allowed();
}

class NeedsUpgrade extends Access {
  const NeedsUpgrade(this.required);
  final Plan required;
}

class DeviceNotSupported extends Access {
  const DeviceNotSupported(this.plan);
  final Plan plan;
}

/// Pure rules for what a plan allows, kept out of the UI so they can be
/// unit-tested. In production the same rules must also run on the server
/// (signed URLs / DRM licence policy), because client checks can be bypassed.
abstract final class AccessPolicy {
  static Access canWatch({required Plan plan, required Plan required, required DeviceClass device}) {
    if (!plan.includes(required)) return NeedsUpgrade(required);
    if (device == DeviceClass.largeScreen && !plan.allowsLargeScreens) {
      return DeviceNotSupported(plan);
    }
    return const Allowed();
  }

  static bool canDownload({required Plan plan, required Plan required}) =>
      plan.allowsDownloads && plan.includes(required);

  /// The cheapest plan that unlocks a given video height.
  static Plan planForHeight(int height) =>
      Plan.values.firstWhere((p) => p.maxHeight >= height, orElse: () => Plan.premium);
}
