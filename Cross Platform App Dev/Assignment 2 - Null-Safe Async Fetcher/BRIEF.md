# Assignment 2 - Null-Safe Async Fetcher

> **Question (10 marks, difficulty: moderate):**
> Null-Safe Async Fetcher: Build a Dart program using null safety, Future, async/await
> to fetch and display mock API data; handle null and error cases.

## Details (pulled from Lisa)

| field | value |
|-------|-------|
| subject | Cross Platform App Development (Sem 5) |
| chapter | Dart Fundamentals |
| topic | Classes and OOP: Classes, constructors, inheritance, mixins, interfaces |
| total marks | 10 |
| difficulty | moderate |
| min questions | 1 |
| trainer | Poonam Khanvilkar (poonams@itm.edu) |
| deadline (expiresAt) | 2026-09-30 08:40 UTC |
| attached files | none |
| source content id | 6a97e123d7d4c2920b5689e2 |
| status when saved | not submitted / pending |

Heads up: the chapter topic tag says "Classes and OOP", but the actual graded question is about
null safety + async. so i built for the question (thats the thing with marks on it), and still
used a proper `User` class with a constructor and a factory so the OOP box is ticked too.

## What the question is really asking for

- **null safety** -> a model where some fields can be missing (email, age are nullable)
- **Future + async/await** -> a fake api call that takes time, then we await it
- **display mock api data** -> print each user as a clean line
- **handle null case** -> missing email shows "no email on file" instead of the word null
- **handle error case** -> a failed call gets caught, we skip it, the app keeps running

See `README.md` for the walkthrough and how to run it.
