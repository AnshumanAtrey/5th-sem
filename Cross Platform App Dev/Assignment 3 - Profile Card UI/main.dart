// Assignment 3 - Profile Card UI
// Cross Platform App Development, Sem 5
// Anshuman Atrey
//
// a single profile card, like the top of your linkedin or instagram profile:
// a round avatar, a name, a role line, a row of stat numbers, and a couple of action buttons.
// built only with Column, Row, Container, CircleAvatar, Text and Icon, on a custom colour theme.

import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

// our custom theme colours, kept in one place so the whole card stays consistent.
const kPrimary = Color(0xFF5B2EFF);
const kAccent = Color(0xFF00D0B0);

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(scaffoldBackgroundColor: const Color(0xFFF2F0FF)),
      home: const ProfileScreen(),
    );
  }
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  // small helper so the three stats (posts/followers/following) share one layout.
  Widget stat(String number, String label) {
    return Column(
      children: [
        Text(
          number,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: kPrimary,
          ),
        ),
        Text(label, style: const TextStyle(color: Colors.black54)),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Container(
          margin: const EdgeInsets.all(20),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: const [
              BoxShadow(
                color: Colors.black12,
                blurRadius: 16,
                offset: Offset(0, 6),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircleAvatar(
                radius: 50,
                backgroundColor: kAccent,
                child: Icon(Icons.person, size: 60, color: Colors.white),
              ),
              const SizedBox(height: 16),
              const Text(
                'Anshuman Atrey',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.code, size: 16, color: kPrimary),
                  SizedBox(width: 6),
                  Text(
                    'Flutter Developer',
                    style: TextStyle(color: Colors.black54),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              // the stat row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  stat('128', 'Posts'),
                  stat('4.2k', 'Followers'),
                  stat('312', 'Following'),
                ],
              ),
              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 28,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: kPrimary,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'Follow',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      border: Border.all(color: kPrimary),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.message, color: kPrimary),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
