// Assignment 8 - API Data Fetcher with Local Cache
// Cross Platform App Development, Sem 5
// Anshuman Atrey
//
// fetch posts from a public API (jsonplaceholder) and show them. FutureBuilder handles the
// three states for us automatically: waiting (spinner), error (message), done (the list).
// then we cache the last good result in SharedPreferences, so next launch we can show something
// instantly even before the network answers, like how instagram shows old posts while it refreshes.
//
// needs these packages in pubspec.yaml:
//   http: ^1.2.0
//   shared_preferences: ^2.2.0

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.blue, useMaterial3: true),
      home: const PostsPage(),
    );
  }
}

class PostsPage extends StatefulWidget {
  const PostsPage({super.key});

  @override
  State<PostsPage> createState() => _PostsPageState();
}

class _PostsPageState extends State<PostsPage> {
  late Future<List<dynamic>> postsFuture;

  @override
  void initState() {
    super.initState();
    postsFuture = loadPosts();
  }

  // try the network first; on success cache it. if the network fails, fall back to the cache.
  Future<List<dynamic>> loadPosts() async {
    final prefs = await SharedPreferences.getInstance();
    try {
      final res = await http.get(
        Uri.parse('https://jsonplaceholder.typicode.com/posts'),
      );
      if (res.statusCode == 200) {
        await prefs.setString(
          'cached_posts',
          res.body,
        ); // cache the last good result
        return jsonDecode(res.body) as List<dynamic>;
      }
      throw Exception('server said ${res.statusCode}');
    } catch (e) {
      final cached = prefs.getString('cached_posts');
      if (cached != null) return jsonDecode(cached) as List<dynamic>;
      rethrow; // nothing cached and network failed -> let FutureBuilder show the error
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Posts'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => setState(() => postsFuture = loadPosts()),
          ),
        ],
      ),
      body: FutureBuilder<List<dynamic>>(
        future: postsFuture,
        builder: (context, snapshot) {
          // 1. still loading
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          // 2. errored and no cache
          if (snapshot.hasError) {
            return Center(child: Text('could not load: ${snapshot.error}'));
          }
          // 3. we have data
          final posts = snapshot.data ?? [];
          return ListView.builder(
            itemCount: posts.length,
            itemBuilder: (context, i) => Card(
              margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              child: ListTile(
                leading: CircleAvatar(child: Text('${posts[i]['id']}')),
                title: Text(posts[i]['title'] ?? ''),
                subtitle: Text(
                  posts[i]['body'] ?? '',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
