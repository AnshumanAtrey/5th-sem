// Classwork 3 - Contact & Services Page
// Cross Platform App Development, Sem 5
// Anshuman Atrey
//
// this is a pure UI screen, like the "services" list you see inside the instagram or paytm menu.
// every row is a service: an icon on the left, name + short line in the middle, an arrow on the right.
// no firebase, no api, no navigation. the buttons just sit there and look clickable (that was the rule).

import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.teal, useMaterial3: true),
      home: const ContactPage(),
    );
  }
}

// a tiny data holder so the list stays clean instead of copy-pasting rows.
class Service {
  final IconData icon;
  final String name;
  final String desc;
  const Service(this.icon, this.name, this.desc);
}

class ContactPage extends StatelessWidget {
  const ContactPage({super.key});

  static const services = <Service>[
    Service(Icons.support_agent, 'Help & Support', 'Talk to our team any time'),
    Service(Icons.feedback_outlined, 'Feedback', 'Tell us what to improve'),
    Service(Icons.location_on_outlined, 'Find Us', 'Locate the nearest branch'),
    Service(Icons.mail_outline, 'Email Us', 'Drop us a message'),
    Service(Icons.call_outlined, 'Call Center', 'Open 9am to 9pm'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Contact & Services')),
      body: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          const Padding(
            padding: EdgeInsets.all(8),
            child: Text(
              'How can we help you?',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
          ),
          // turn each Service into a Card row. Expanded lets the middle text take the slack.
          for (final s in services)
            Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Row(
                  children: [
                    Icon(s.icon, size: 34, color: Colors.teal),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            s.name,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            s.desc,
                            style: const TextStyle(color: Colors.black54),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed:
                          () {}, // no logic needed, just has to look tappable
                      icon: const Icon(Icons.arrow_forward_ios, size: 16),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
