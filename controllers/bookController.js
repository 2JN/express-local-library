var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');

var async = require('async');
var debug = require('debug')('book');

exports.index = function(req, res, next) {
  async.parallel(
    {
      book_count: function(callback) {
        Book.count(callback);
      },

      book_instance_count: function(callback) {
        BookInstance.count(callback);
      },

      book_instance_available_count: function(callback) {
        BookInstance.count({status: 'Available'}, callback);
      },

      author_count: function(callback) {
        Author.count(callback);
      },

      genre_count: function(callback) {
        Genre.count(callback);
      }
    },

    function(err, results) {
      res.render('index', {
        title: 'Local Library Home',
        error: err,
        data: results
      });
    }
  );
};

exports.book_list = function(req, res, next) {
  Book.find({}, 'title author')
    .populate('author')
    .exec(function(err, list_books) {
      if (err) { return next(err); }

      res.render('book_list', { title: 'Book List', book_list: list_books });
    });
};

exports.book_detail = function(req, res, next) {
  async.parallel(
    {
      book: function(callback) {
        Book.findById(req.params.id)
          .populate('author')
          .populate('genre')
          .exec(callback);
      },

      book_instance: function(callback) {
        BookInstance.find({ 'book': req.params.id })
          .exec(callback);
      }
    },

    function(err, results) {
      if (err) { return next(err); }

      res.render('book_detail', {
        title: 'Title',
        book: results.book,
        book_instances: results.book_instance
      });
    }
  );
};

exports.book_create_get = function(req, res, next) {
  async.parallel(
    {
      authors: function(callback) {
        Author.find(callback);
      },

      genres: function(callback) {
        Genre.find(callback);
      }
    },

    function(err, results) {
      if (err) { return next(err); }

      res.render('book_form', {
        title: 'Create Book',
        authors: results.authors,
        genres: results.genres
      });
    }
  );
};

exports.book_create_post = function(req, res, next) {
  req.checkBody('title', 'Title must not be empty.').notEmpty();
  req.checkBody('author', 'Author must not be empty.').notEmpty();
  req.checkBody('summary', 'Summary must not be empty').notEmpty();
  req.checkBody('isbn', 'ISBN must not be empty').notEmpty();

  req.sanitize('title').escape();
  req.sanitize('author').escape();
  req.sanitize('summary').escape();
  req.sanitize('isbn').escape();
  req.sanitize('title').trim();
  req.sanitize('author').trim();
  req.sanitize('summary').trim();
  req.sanitize('isbn').trim();
  req.sanitize('genre').escape();

  var book = new Book({
    title: req.body.title,
    author: req.body.author,
    summary: req.body.summary,
    isbn: req.body.isbn,
    genre: (typeof req.body.genre === 'undefined')
      ? []
      : req.body.genre.split(',')
  });

  debug('Book:' + book);

  var errors = req.validationErrors();
  if (errors) {
    async.parallel(
      {
        authors: function(callback) {
          Author.find(callback);
        },

        genres: function(callback) {
          Genre.find(callback);
        }
      },

      function(err, results) {
        if (err) { return next(err); }

        results.genres.forEach(function(genre) {
          if (book.genre.indexOf(genre._id) > -1) {
            genre.checked = 'true';
          }
        });

        res.render('book_form', {
          title: 'Create Book',
          authors: results.authors,
          genres: results.genres,
          book: book,
          errors: errors
        });
      }
    );
  } else {
    book.save(function(err) {
      if (err) { return next(err); }

      res.redirect(book.url);
    });
  }
};

exports.book_delete_get = function(req, res, next) {
  async.parallel(
    {
      book: function(callback) {
        Book.findById(req.params.id).exec(callback);
      },

      book_bookinstances: function(callback) {
        BookInstance.find({ book: req.params.id }).exec(callback);
      }
    },

    function(err, results) {
      if (err) { return next(err); }

      res.render('book_delete', {
        title: 'Delete Book',
        book: results.book,
        book_bookinstances: results.book_bookinstances
      });
    }
  );
};

exports.book_delete_post = function(req, res, next) {
  req.checkBody('bookid', 'Book id must exist').notEmpty();

  async.parallel(
    {
      book: function(callback) {
        Book.findById(req.body.bookid).exec(callback);
      },

      book_bookinstances: function(callback) {
        BookInstance.find({ book: req.body.bookid }, 'status')
          .exec(callback);
      }
    },

    function(err, results) {
      if (err) { return next(err); }

      if(results.book_bookinstances) {
        res.render('book_delete', {
          title: 'Delete Book',
          book: results.book,
          book_bookinstances: results.book_bookinstances
        });

        return;
      } else {
        Book.findByIdAndRemove(req.body.bookid, function(err) {
          if (err) { return next(err); }

          res.redirect('/catalog/books');
        });
      }
    }
  );
};

exports.book_update_get = function(req, res, next) {
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  async.parallel(
    {
      book: function(callback) {
        Book.findById(req.params.id)
          .populate('author')
          .populate('genre')
          .exec(callback);
      },

      authors: function(callback) {
        Author.find(callback);
      },

      genres: function(callback) {
        Genre.find(callback);
      }
    },

    function(err, results) {
      if (err) { return next(err); }

      results.genres.forEach((genre) => {
        results.book.genre.forEach((bookGenre) => {
          if(bookGenre.toString() == genre.toString()) {
            genre.checked='true';
          }
        });
      });

      res.render('book_form', {
        title: 'Update Book',
        authors: results.authors,
        genres: results.genres,
        book: results.book
      });
    }
  );
};

exports.book_update_post = function(req, res, next) {
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  req.checkBody('title', 'Title must not be empty').notEmpty();
  req.checkBody('author', 'Author must not be empty').notEmpty();
  req.checkBody('summary', 'Summary must not be empty').notEmpty();
  req.checkBody('isbn', 'ISBN must not be empty').notEmpty();

  req.sanitize('title').escape();
  req.sanitize('author').escape();
  req.sanitize('summary').escape();
  req.sanitize('isbn').escape();
  req.sanitize('title').trim();
  req.sanitize('author').trim();
  req.sanitize('summary').trim();
  req.sanitize('isbn').trim();
  req.sanitize('genre').escape();

  var book = new Book({
    title: req.body.title,
    author: req.body.author,
    summary: req.body.summary,
    isbn:req.body.isbn,
    genre: (typeof req.body.genre === 'undefined')
      ? []
      : req.body.genre.split(','),
    _id: req.params.id
  });

  var errors = req.validationErrors();
  if (errors) {
    async.parallel(
      {
        authors: function(callback) {
          Author.find(callback);
        },

        genres: function(callback) {
          Genre.find(callback);
        }
      },

      function(err, results) {
        if (err) { return next(err); }

        results.genres.forEach((genre) => {
          if (book.genre.indexOf(genre._id) > -1) {
            genre.checked = 'true';
          }
        });

        res.render('book_form', {
          title: 'Update Book',
          authors: results.authors,
          genres:results.genres,
          book: book,
          errors: errors
        });
      }
    );
  } else {
    Book.findByIdAndUpdate(req.params.id, book, {}, function(err, thebook) {
      if (err) { return next(err); }

      res.redirect(thebook.url);
    });
  }
};
