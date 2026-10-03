// Assignment 6 - Dynamic Product Catalog
// Cross Platform App Development, Sem 5
// Anshuman Atrey
//
// a shopping catalog, like scrolling products on amazon. the full list is built efficiently with
// ListView.builder (it only builds the rows on screen, not all 1000 at once). the search box filters
// the list live: we keep the query in state and recompute the visible list on every keystroke.

import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.deepOrange, useMaterial3: true),
      home: const CatalogPage(),
    );
  }
}

// our data model class, instead of loose maps.
class Product {
  final String name;
  final String category;
  final double price;
  const Product(this.name, this.category, this.price);
}

class CatalogPage extends StatefulWidget {
  const CatalogPage({super.key});

  @override
  State<CatalogPage> createState() => _CatalogPageState();
}

class _CatalogPageState extends State<CatalogPage> {
  final List<Product> all = const [
    Product('Wireless Mouse', 'Electronics', 799),
    Product('Mechanical Keyboard', 'Electronics', 2499),
    Product('Running Shoes', 'Fashion', 1999),
    Product('Coffee Mug', 'Home', 299),
    Product('Notebook', 'Stationery', 149),
    Product('Bluetooth Speaker', 'Electronics', 1599),
    Product('Backpack', 'Fashion', 1299),
    Product('Desk Lamp', 'Home', 899),
  ];
  String query = '';

  @override
  Widget build(BuildContext context) {
    // the filtered view: if query is empty show everything, else match name or category.
    final shown = all
        .where(
          (p) =>
              p.name.toLowerCase().contains(query.toLowerCase()) ||
              p.category.toLowerCase().contains(query.toLowerCase()),
        )
        .toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Product Catalog')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: TextField(
              decoration: const InputDecoration(
                prefixIcon: Icon(Icons.search),
                hintText: 'search products or category...',
                border: OutlineInputBorder(),
              ),
              onChanged: (v) => setState(() => query = v),
            ),
          ),
          Expanded(
            child: shown.isEmpty
                ? const Center(child: Text('no products match your search'))
                : ListView.builder(
                    itemCount: shown.length,
                    itemBuilder: (context, i) {
                      final p = shown[i];
                      return Card(
                        margin: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 4,
                        ),
                        child: ListTile(
                          leading: const CircleAvatar(
                            child: Icon(Icons.shopping_bag),
                          ),
                          title: Text(p.name),
                          subtitle: Text(p.category),
                          trailing: Text(
                            '₹${p.price.toStringAsFixed(0)}',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
