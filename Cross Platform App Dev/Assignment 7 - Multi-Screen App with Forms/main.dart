// Assignment 7 - Multi-Screen App with Forms
// Cross Platform App Development, Sem 5
// Anshuman Atrey
//
// a 3-screen flow, like signing up for any app: Home -> (tap) -> Form -> (submit) -> Detail.
// screens are wired with NAMED ROUTES (like page addresses: '/', '/form', '/detail'). the form
// uses a GlobalKey<FormState> + validators so it refuses to move on until email/password/name are valid.

import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.indigo, useMaterial3: true),
      initialRoute: '/',
      // the three named routes = the three screens.
      routes: {
        '/': (_) => const HomeScreen(),
        '/form': (_) => const FormScreen(),
        '/detail': (_) => const DetailScreen(),
      },
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Home')),
      body: Center(
        child: ElevatedButton(
          onPressed: () => Navigator.pushNamed(context, '/form'),
          child: const Text('Register'),
        ),
      ),
    );
  }
}

class FormScreen extends StatefulWidget {
  const FormScreen({super.key});

  @override
  State<FormScreen> createState() => _FormScreenState();
}

class _FormScreenState extends State<FormScreen> {
  final _formKey = GlobalKey<FormState>();
  final name = TextEditingController();
  final email = TextEditingController();
  final password = TextEditingController();

  void submit() {
    // validate() runs every field's validator; only navigate if all return null.
    if (_formKey.currentState!.validate()) {
      Navigator.pushNamed(
        context,
        '/detail',
        arguments: {'name': name.text, 'email': email.text},
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Registration Form')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: name,
                decoration: const InputDecoration(labelText: 'Name'),
                validator: (v) =>
                    (v == null || v.isEmpty) ? 'name is required' : null,
              ),
              TextFormField(
                controller: email,
                decoration: const InputDecoration(labelText: 'Email'),
                validator: (v) => (v == null || !v.contains('@'))
                    ? 'enter a valid email'
                    : null,
              ),
              TextFormField(
                controller: password,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Password'),
                validator: (v) => (v == null || v.length < 6)
                    ? 'password must be 6+ characters'
                    : null,
              ),
              const SizedBox(height: 24),
              ElevatedButton(onPressed: submit, child: const Text('Submit')),
            ],
          ),
        ),
      ),
    );
  }
}

class DetailScreen extends StatelessWidget {
  const DetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // read the data we passed through the named route.
    final args =
        ModalRoute.of(context)!.settings.arguments as Map<String, String>?;
    return Scaffold(
      appBar: AppBar(title: const Text('Welcome')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 80),
            const SizedBox(height: 16),
            Text(
              'Registered: ${args?['name'] ?? '-'}',
              style: const TextStyle(fontSize: 20),
            ),
            Text(
              args?['email'] ?? '-',
              style: const TextStyle(color: Colors.black54),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () =>
                  Navigator.popUntil(context, ModalRoute.withName('/')),
              child: const Text('Back to Home'),
            ),
          ],
        ),
      ),
    );
  }
}
