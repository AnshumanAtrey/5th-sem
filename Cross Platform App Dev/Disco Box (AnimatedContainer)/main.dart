// Create Disco Box - AnimatedContainer & AnimatedOpacity
// Cross Platform App Development, Sem 5
// Anshuman Atrey
//
// tap the square and it throws a little party: it grows and rounds itself into a glowing circle,
// flips orange -> purple, drops a neon shadow, and the text "SUPER!" fades in with a springy bounce.
// the trick: we just flip one bool (on) and change the target values. AnimatedContainer and
// AnimatedOpacity animate *between* the old and new values on their own, no manual tweening.

import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: DiscoBox(),
    );
  }
}

class DiscoBox extends StatefulWidget {
  const DiscoBox({super.key});

  @override
  State<DiscoBox> createState() => _DiscoBoxState();
}

class _DiscoBoxState extends State<DiscoBox> {
  bool on = false; // the single switch that drives every animated value.

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            GestureDetector(
              onTap: () => setState(() => on = !on),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 600),
                curve: Curves.elasticOut, // the springy, overshooting bounce.
                width: on ? 200 : 120,
                height: on ? 200 : 120,
                decoration: BoxDecoration(
                  color: on ? Colors.purple : Colors.orange,
                  // 100 radius on a 200 box = a perfect circle; 16 = a rounded square.
                  borderRadius: BorderRadius.circular(on ? 100 : 16),
                  boxShadow: [
                    BoxShadow(
                      color: (on ? Colors.purpleAccent : Colors.orangeAccent)
                          .withValues(alpha: 0.9),
                      blurRadius: on ? 40 : 8,
                      spreadRadius: on ? 6 : 0,
                    ),
                  ],
                ),
                alignment: Alignment.center,
                child: AnimatedOpacity(
                  duration: const Duration(milliseconds: 600),
                  opacity: on
                      ? 1
                      : 0, // text fades in only when the box is "on".
                  child: const Text(
                    '⚡ SUPER! ⚡',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 40),
            const Text(
              'tap the square',
              style: TextStyle(color: Colors.white54),
            ),
          ],
        ),
      ),
    );
  }
}
