// Classwork 4 - Food Dashboard UI
// Cross Platform App Development, Sem 5
// Anshuman Atrey
//
// the home screen of a food app like swiggy/zomato: a search bar, a horizontal strip of
// categories, and a grid of food cards. pure UI, no ordering logic. uses a horizontal ListView
// for the categories and a GridView for the dishes.

import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.red, useMaterial3: true),
      home: const FoodDashboard(),
    );
  }
}

class FoodDashboard extends StatelessWidget {
  const FoodDashboard({super.key});

  static const categories = ['Pizza', 'Burger', 'Biryani', 'Dosa', 'Dessert'];
  static const dishes = [
    ['Margherita Pizza', '₹249'],
    ['Veg Burger', '₹129'],
    ['Chicken Biryani', '₹299'],
    ['Masala Dosa', '₹99'],
    ['Choco Lava Cake', '₹149'],
    ['Cold Coffee', '₹119'],
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('FoodHub')),
      body: ListView(
        padding: const EdgeInsets.all(12),
        children: [
          // search bar (no logic, just the look)
          TextField(
            decoration: InputDecoration(
              prefixIcon: const Icon(Icons.search),
              hintText: 'search for food...',
              filled: true,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Categories',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),
          // horizontal scrolling chips
          SizedBox(
            height: 44,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (context, i) => Chip(
                avatar: const Icon(Icons.local_dining, size: 18),
                label: Text(categories[i]),
              ),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Popular Now',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),
          // grid of dishes. shrinkWrap + NeverScroll so it nests inside the outer ListView.
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: dishes.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 0.9,
            ),
            itemBuilder: (context, i) {
              return Card(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Expanded(
                      child: Icon(Icons.fastfood, size: 50, color: Colors.red),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(8),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            dishes[i][0],
                            style: const TextStyle(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            dishes[i][1],
                            style: const TextStyle(color: Colors.red),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Search'),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart),
            label: 'Cart',
          ),
        ],
      ),
    );
  }
}
