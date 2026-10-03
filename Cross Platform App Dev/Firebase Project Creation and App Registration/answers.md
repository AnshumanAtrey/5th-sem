# Firebase Project Creation & App Registration — Answers

Cross Platform App Development, Sem 5 · Anshuman Atrey · 150096724029

This is the short-answer (conceptual) submission for the Firebase task. Answers in plain words.

## Q1. Configuration & Initial Setup

**What does `google-services.json` store, and why must it sit in `android/app`?**
It is the config card Firebase hands your Android app. It holds the project id, the app id, the API
key, and the Firebase service URLs (Auth, Firestore, Storage) for your specific project. It must live
in `android/app/` because the Google Services Gradle plugin looks there at build time to wire these
values into the app. If it is anywhere else, the build cannot find it and Firebase has no idea which
project to talk to.

**Why call `WidgetsFlutterBinding.ensureInitialized()` before `Firebase.initializeApp()`?**
`Firebase.initializeApp()` is async and touches native (platform) channels. Those channels only
exist once Flutter's engine binding is ready. Calling `WidgetsFlutterBinding.ensureInitialized()`
first forces that binding to be set up before `main()` does any async platform work, so Firebase has
a live bridge to the native side. Skip it and you get a "binding not initialized" crash.

## Q2. Authentication Architecture

**Email/Password vs OAuth Google Sign-In.**
Email/Password is self-contained: the user types an email and password, Firebase stores and checks
them. Google Sign-In is OAuth: you hand the login off to Google, the user approves, and Google hands
back a token you trade for a Firebase session. The extra steps for Google Sign-In on Android are:
adding your app's **SHA-1 (and SHA-256) fingerprint** in the Firebase console so Google trusts your
build, and setting up the **OAuth consent screen** so Google knows what your app is asking for.

**How do `StreamBuilder` + `authStateChanges()` keep the session across restarts?**
`FirebaseAuth.instance.authStateChanges()` is a stream that fires whenever the login state changes
(and once on startup with the current state). Wrapping the app in a `StreamBuilder` on that stream
means the UI automatically shows the login screen when signed out and the home screen when signed in.
Firebase persists the token on the device, so after a restart the stream emits the still-logged-in
user and the app lands on the home screen without asking the user to sign in again.

## Q3. Firestore & Cloud Storage Mechanics

**`.get()` once vs `.snapshots()` real-time.**
`.get()` is a one-time photo: it fetches the document as it is right now and stops. `.snapshots()` is
a live video feed: it returns a stream that pushes a new value every time the document changes on the
server, so the UI updates on its own. Use `.get()` for a value you only need once (e.g. a config read);
use `.snapshots()` for anything that should stay live (chat messages, a shared counter).

**Why use `UploadTask` progress listeners instead of blocking the UI?**
A file upload can take seconds on a slow network. If you `await` it and freeze the screen, the app
looks hung and the user may force-quit. Listening to the `UploadTask` progress lets you show a
percentage/progress bar and keep the UI responsive, and you can let the user cancel. The upload runs
in the background while the app stays usable.

## Q4. Security Rules

**`request.auth` vs `resource.data`.**
`request.auth` is about *who is making the request* — it holds the signed-in user's info (their `uid`,
token), or is `null` if nobody is signed in. `resource.data` is about *the document being touched* —
it holds the existing field values of that document. So a rule like
`allow update: if request.auth.uid == resource.data.ownerId;` reads as: "let this update through only
if the person making the request is the same user whose id is stored as the owner on the document."
`request.auth` checks the caller, `resource.data` checks the data.
