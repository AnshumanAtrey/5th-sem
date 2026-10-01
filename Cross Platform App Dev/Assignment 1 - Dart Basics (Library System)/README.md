# assignment 1, dart basics (library system)

small dart console program that models a tiny library. its the "hello world" of OOP basically,
just enough to touch every dart fundamental in one place.

## the analogy i used

think of a library like a small kirana shop, but for books. everything on the shelf is an "item".
a book is an item, a magazine is an item. they both get borrowed and returned the same way,
but a book has an author and page count, a magazine has an issue number.

so the shared stuff (borrow, return) goes in one parent class, and the extra stuff goes in the
children. thats the whole idea of inheritance, write the common behaviour once, let the kids add
their own flavour on top.

## where each required concept shows up

the question asked for variables, loops, functions, OOP with inheritance. heres where they live:

- **variables + types** -> `Library`, `Book`, `Magazine` objects in `main()`
- **loops** -> `showShelf()` walks the list with a for loop, `availableCount` uses `where()`
- **functions** -> `borrow()`, `giveBack()`, `findByTitle()`, `describe()`
- **control flow** -> the if/else guards, like "this book is already out with someone"
- **OOP + inheritance** -> `abstract class LibraryItem` is the parent, `Book` and `Magazine` extend it

quick example of the guard doing its job: if you try to borrow "Clean Code" twice in a row,
the first time it goes out, the second time it tells you its already gone. no crash, just a polite no.

## how to run

```bash
cd "Assignment 1 - Dart Basics (Library System)"
dart run bin/library_system.dart
```

## sample output

```
== ISU Central Library shelf (3 items) ==
  1. [book] Dart Up and Running by Kathy Walrath, 160 pages (available)
  2. [book] Clean Code by Robert Martin, 464 pages (available)
  3. [mag]  Digit issue #8 (available)

== borrowing ==
  > you borrowed "Clean Code"
  x "Clean Code" is already out with someone

== returning ==
  < you returned "Clean Code"

available right now: 3 of 3
```

`dart analyze` comes back clean, no issues.
