# assignment 2, null-safe async fetcher

dart console program that pretends to hit an api, waits for the data, and then shows it,
without crashing when stuff is missing or the call straight up fails.

## the analogy i used

imagine ordering food on swiggy. you tap order, then you wait. the food does not teleport onto
your table the second you tap, it arrives later, in the future. thats exactly what a `Future` is
in dart, a box that will hold a value after some time. and `async/await` is just you saying
"wait for the food, then eat", instead of grabbing an empty plate right away.

now real life is messy so we plan for two things:

- the order fails (restaurant closed) -> thats an **error**, we catch it and move on
- the address is missing (email/age not given) -> thats a **null**, we show a fallback

## where each required concept shows up

the question asked for null safety, Future, async/await, and handling null + error cases:

- **null safety** -> in the `User` class, `email` and `age` are `String?` and `int?` (the `?` means "can be missing")
- **Future** -> `fetchUserRaw()` returns a `Future`, because a real network call takes time
- **async/await** -> `getUser()` and `main()` are async and `await` the call
- **null case** -> if email is missing, `??` swaps in "no email on file" so the user never sees the word null
- **error case** -> the `try/catch` in `getUser()` is the safety net, one bad call does not take the app down

the fake api rolls a dice on every call so you can see all three paths: full data, half data (the null
case), and a 500 error (the error case). run it a couple times and youll see each one show up.

quick example: when the server throws for user 2, you get "could not load, skipping" and the loop
just carries on to user 3. thats the point, one failure should never freeze the whole screen.

## a note on the topic tag

lisa tags this chapter as "Classes and OOP", but the actual graded question is about async and null
safety. so i built for the question (thats where the marks are), and still kept a real `User` class
with a constructor and a `fromJson` factory, so the OOP side is covered too.

## how to run

```bash
cd "Assignment 2 - Null-Safe Async Fetcher"
dart run bin/async_fetcher.dart
```

## sample output (one run)

```
fetching 4 users from the mock api...

user 1: user #1, Anshuman (anshuman@isu.ac.in, age 21)
  ! fetch failed: Exception: server error 500 while fetching user 2
user 2: could not load, skipping
user 3: user #3, Gayatri (no email on file, age not shared)
user 4: user #4, Anshuman (anshuman@isu.ac.in, age 21)

done. notice how missing emails and failed calls never crashed the program.
```

`dart analyze` comes back clean, no issues.
