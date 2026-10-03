// Classwork 2 - Create Your First Flutter Page
// Cross Platform App Development, Sem 5
// Anshuman Atrey
//
// think of a youtube video. the like button sits there doing nothing until you tap it,
// then the count jumps by one and the screen redraws. thats the whole idea of state here:
// a number (likes) that changes, and setState() telling flutter "hey, repaint this".
//
// widget tree we build: main() -> runApp() -> MaterialApp -> Scaffold -> AppBar + body
//                       -> Column -> Row (icon + text) + ElevatedButton.

import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'First Flutter Page',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.indigo, useMaterial3: true),
      home: const LikePage(),
    );
  }
}

// stateful because the likes count is a value that changes while the app runs.
class LikePage extends StatefulWidget {
  const LikePage({super.key});

  @override
  State<LikePage> createState() => _LikePageState();
}

class _LikePageState extends State<LikePage> {
  int likes = 0; // this is our state. starts at zero.

  void addLike() {
    // setState wraps the change so flutter knows to rebuild the UI with the new number.
    setState(() => likes++);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My First Page')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Welcome to my first Flutter page',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            // a Row to sit the heart icon next to the live count.
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.favorite, color: Colors.red, size: 30),
                const SizedBox(width: 10),
                Text('$likes likes', style: const TextStyle(fontSize: 20)),
              ],
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: addLike,
              icon: const Icon(Icons.thumb_up),
              label: const Text('Like'),
            ),
          ],
        ),
      ),
    );
  }
}
