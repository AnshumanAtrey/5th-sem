// Assignment 5 - Todo List App with State
// Cross Platform App Development, Sem 5
// Anshuman Atrey
//
// a classic todo list, like a checklist on paper. you add a task, tick it off when done,
// or cross it out (delete) if it no longer matters. the whole list lives in state, and every
// add / toggle / delete is wrapped in setState() so the UI redraws with the new list.

import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.green, useMaterial3: true),
      home: const TodoPage(),
    );
  }
}

// one task = its text + whether it is done.
class Task {
  String title;
  bool done;
  Task(this.title, {this.done = false});
}

class TodoPage extends StatefulWidget {
  const TodoPage({super.key});

  @override
  State<TodoPage> createState() => _TodoPageState();
}

class _TodoPageState extends State<TodoPage> {
  final List<Task> tasks = [];
  final controller = TextEditingController();

  void addTask() {
    final text = controller.text.trim();
    if (text.isEmpty) return; // ignore empty adds
    setState(() => tasks.add(Task(text)));
    controller.clear();
  }

  void toggle(int i) => setState(() => tasks[i].done = !tasks[i].done);
  void remove(int i) => setState(() => tasks.removeAt(i));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Todos')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: controller,
                    decoration: const InputDecoration(
                      hintText: 'add a task...',
                      border: OutlineInputBorder(),
                    ),
                    onSubmitted: (_) => addTask(),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(onPressed: addTask, child: const Text('Add')),
              ],
            ),
          ),
          Expanded(
            child: tasks.isEmpty
                ? const Center(child: Text('no tasks yet, add one above'))
                : ListView.builder(
                    itemCount: tasks.length,
                    itemBuilder: (context, i) {
                      final t = tasks[i];
                      return ListTile(
                        leading: Checkbox(
                          value: t.done,
                          onChanged: (_) => toggle(i),
                        ),
                        title: Text(
                          t.title,
                          style: TextStyle(
                            decoration: t.done
                                ? TextDecoration.lineThrough
                                : null,
                            color: t.done ? Colors.grey : null,
                          ),
                        ),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () => remove(i),
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
