// Assignment 4 - Responsive Dashboard UI
// Cross Platform App Development, Sem 5
// Anshuman Atrey
//
// a dashboard that reshapes itself for the screen it is on, like how a website looks different on
// a phone vs a laptop. we ask MediaQuery "how wide are we?" and pick the number of grid columns
// from that. Expanded/Flexible share the leftover space so nothing overflows. built with ListView
// (outer scroll) + GridView (the stat tiles).

import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.blue, useMaterial3: true),
      home: const Dashboard(),
    );
  }
}

class Dashboard extends StatelessWidget {
  const Dashboard({super.key});

  static const stats = [
    ['Sales', '₹1.2L', Icons.trending_up, Colors.green],
    ['Users', '8,430', Icons.people, Colors.blue],
    ['Orders', '1,205', Icons.shopping_bag, Colors.orange],
    ['Revenue', '₹3.4L', Icons.account_balance_wallet, Colors.purple],
  ];

  @override
  Widget build(BuildContext context) {
    // the responsive decision: wide screen -> more columns, narrow phone -> 2.
    final width = MediaQuery.of(context).size.width;
    final columns = width > 900 ? 4 : (width > 600 ? 3 : 2);

    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // a header row where the title flexes and a button stays its natural size.
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Overview',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
              ),
              Flexible(
                child: ElevatedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.add),
                  label: const Text('New'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: stats.length,
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: columns, // <-- this is what makes it responsive
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.4,
            ),
            itemBuilder: (context, i) {
              final s = stats[i];
              return Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: (s[3] as Color).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Icon(s[2] as IconData, color: s[3] as Color, size: 30),
                    Text(
                      s[1] as String,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      s[0] as String,
                      style: const TextStyle(color: Colors.black54),
                    ),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 20),
          const Text(
            'Recent Activity',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          for (int i = 1; i <= 5; i++)
            Card(
              child: ListTile(
                leading: const CircleAvatar(child: Icon(Icons.receipt_long)),
                title: Text('Order #${1000 + i}'),
                subtitle: const Text('Delivered'),
                trailing: const Icon(Icons.check_circle, color: Colors.green),
              ),
            ),
        ],
      ),
    );
  }
}
