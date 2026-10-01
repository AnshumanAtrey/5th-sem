// Assignment 1 - Dart Basics Script
// Cross Platform App Development, Sem 5
// Anshuman Atrey
//
// think of the library like a small kirana shop but for books.
// everything sitting on the shelf is a "LibraryItem". a book is an item, a magazine is an item.
// they share the same shelf behaviour (borrow, return), but each one carries its own extra details.
// so the shared behaviour lives in the parent class, the extra stuff lives in the children.
// thats basically what inheritance is.

// the parent. abstract means you never put a raw "LibraryItem" on the shelf,
// you always put an actual book or magazine (you dont sell "grocery", you sell rice or dal).
abstract class LibraryItem {
  final String id;
  final String title;
  bool isBorrowed;

  LibraryItem(this.id, this.title, {this.isBorrowed = false});

  // every item gets borrowed the exact same way, so this logic sits once, in the parent.
  void borrow() {
    if (isBorrowed) {
      print('  x "$title" is already out with someone');
    } else {
      isBorrowed = true;
      print('  > you borrowed "$title"');
    }
  }

  void giveBack() {
    if (!isBorrowed) {
      print('  x "$title" was never borrowed, nothing to return');
    } else {
      isBorrowed = false;
      print('  < you returned "$title"');
    }
  }

  // each child fills this in its own way. like everyone signs the same register
  // but writes their own name.
  String describe();
}

// child 1. a book adds an author and a page count.
class Book extends LibraryItem {
  final String author;
  final int pages;

  Book(super.id, super.title, this.author, this.pages);

  @override
  String describe() =>
      '[book] $title by $author, $pages pages ${isBorrowed ? "(out)" : "(available)"}';
}

// child 2. a magazine does not have an author, it has an issue number instead.
class Magazine extends LibraryItem {
  final int issueNumber;

  Magazine(super.id, super.title, this.issueNumber);

  @override
  String describe() =>
      '[mag]  $title issue #$issueNumber ${isBorrowed ? "(out)" : "(available)"}';
}

// the library itself. it just holds a list of items and knows a few tricks on top.
class Library {
  final String name;
  final List<LibraryItem> _items = [];

  Library(this.name);

  void add(LibraryItem item) => _items.add(item);

  // plain function doing one job: walk the shelf with a loop and print each item.
  void showShelf() {
    print('\n== $name shelf (${_items.length} items) ==');
    for (var i = 0; i < _items.length; i++) {
      print('  ${i + 1}. ${_items[i].describe()}');
    }
  }

  // search by title. returns null when nothing matches, and we deal with that null at the call site.
  LibraryItem? findByTitle(String query) {
    for (final item in _items) {
      if (item.title.toLowerCase() == query.toLowerCase()) return item;
    }
    return null;
  }

  // uses the where() loop under the hood to count whats still on the shelf.
  int get availableCount => _items.where((item) => !item.isBorrowed).length;
}

void main() {
  // variables + types
  final library = Library('ISU Central Library');

  // add a few items, a mix of books and magazines
  library.add(Book('B1', 'Dart Up and Running', 'Kathy Walrath', 160));
  library.add(Book('B2', 'Clean Code', 'Robert Martin', 464));
  library.add(Magazine('M1', 'Digit', 8));

  library.showShelf();

  // borrow flow
  print('\n== borrowing ==');
  final wanted = library.findByTitle('Clean Code');
  if (wanted != null) {
    wanted.borrow();
  } else {
    print('  x not on the shelf');
  }

  // try borrowing the same book again, just to show the guard kicking in
  wanted?.borrow();

  // return flow
  print('\n== returning ==');
  wanted?.giveBack();

  // final count using operators + string interpolation
  library.showShelf();
  print('\navailable right now: ${library.availableCount} of 3');
}
