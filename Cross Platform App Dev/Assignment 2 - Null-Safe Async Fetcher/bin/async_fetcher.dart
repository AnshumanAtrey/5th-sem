// Assignment 2 - Null-Safe Async Fetcher
// Cross Platform App Development, Sem 5
// Anshuman Atrey
//
// imagine ordering food on swiggy. you tap order, then you wait. the food does not
// teleport onto your table instantly, it shows up "later, in the future".
// thats exactly what a Future is in dart, a box that will hold a value after some time.
// async/await is just us saying "wait for the food, then eat", instead of eating an empty plate.
//
// and real life is messy, so we plan for two problems:
//  1. the order fails (restaurant closed) -> thats an error, we catch it.
//  2. the address is missing (null) -> thats null safety, we give a fallback.

import 'dart:math';

// a small model class. some fields might not come back from the api,
// so we mark those nullable with a ? . name is required, email and age are optional.
// this is null safety on paper: the type itself tells you what can be missing.
class User {
  final int id;
  final String name;
  final String? email; // can be null
  final int? age; // can be null

  User({required this.id, required this.name, this.email, this.age});

  // factory constructor that builds a User out of a raw map (basically json).
  // it survives missing keys instead of blowing up.
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      name: (json['name'] as String?) ?? 'unknown', // fallback if name is missing
      email: json['email'] as String?,
      age: json['age'] as int?,
    );
  }

  // ?? hands over a default when the value is null, so the user never sees the word "null".
  // like when a form field is empty and you show "not provided" instead of a blank.
  String card() {
    final shownEmail = email ?? 'no email on file';
    final shownAge = age?.toString() ?? 'not shared';
    return 'user #$id, $name ($shownEmail, age $shownAge)';
  }
}

// pretend api. it returns a Future because a real network call takes time.
// it randomly does one of three things, so we can see every path:
//  full data, half data (null case), or a crash (error case).
Future<Map<String, dynamic>> fetchUserRaw(int id) async {
  // fake network delay, same idea as the loading spinner you see everywhere
  await Future.delayed(Duration(milliseconds: 400));

  final dice = Random().nextInt(3);
  if (dice == 0) {
    // happy path, everything present
    return {'id': id, 'name': 'Anshuman', 'email': 'anshuman@isu.ac.in', 'age': 21};
  } else if (dice == 1) {
    // partial data, email and age just did not come (the null case)
    return {'id': id, 'name': 'Gayatri'};
  } else {
    // the server said no (the error case)
    throw Exception('server error 500 while fetching user $id');
  }
}

// wraps the raw fetch. gives back a User, or null if anything went wrong.
// the try/catch is the safety net so one bad call does not take the whole app down.
Future<User?> getUser(int id) async {
  try {
    final raw = await fetchUserRaw(id);
    return User.fromJson(raw);
  } catch (e) {
    print('  ! fetch failed: $e');
    return null; // let the caller decide what to do with a null
  }
}

Future<void> main() async {
  print('fetching 4 users from the mock api...\n');

  // loop that awaits each call, one at a time
  for (var id = 1; id <= 4; id++) {
    final user = await getUser(id);

    // the null check. if the fetch failed we get null back,
    // so we handle it and move on instead of crashing.
    if (user == null) {
      print('user $id: could not load, skipping\n');
      continue;
    }

    print('user $id: ${user.card()}\n');
  }

  print('done. notice how missing emails and failed calls never crashed the program.');
}
