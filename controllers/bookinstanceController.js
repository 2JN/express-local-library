var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');

var async = require('async');

exports.bookinstance_list = function(req, res, next) {
  BookInstance.find()
    .populate('book')
    .exec(function(err, list_bookinstances) {
      if (err) { return next(err); }

      res.render('bookinstance_list', {
        title: 'Book Instance List',
        bookinstance_list: list_bookinstances
      });
    });
};

exports.bookinstance_detail = function(req, res, next) {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function(err, bookinstance) {
      if (err) { return next(err); }

      res.render('bookinstance_detail', {
        title: 'Book:',
        bookinstance: bookinstance
      });
    });
};

exports.bookinstance_create_get = function(req, res, next) {
  Book.find({}, 'title')
    .exec(function(err, books) {
      if (err) { return next(err); }

      res.render('bookinstance_form', {
        title: 'Create BookInstance',
        book_list: books
      });
    });
};

exports.bookinstance_create_post = function(req, res, next) {
  req.checkBody('book', 'Book must be specified').notEmpty();
  req.checkBody('imprint', 'Imprint must be specified').notEmpty();
  req.checkBody('due_back', 'Invalid date')
    .optional({ checkFalsy: true }).isDate();

  req.sanitize('book').escape();
  req.sanitize('imprint').escape();
  req.sanitize('status').escape();
  req.sanitize('book').trim();
  req.sanitize('imprint').trim();
  req.sanitize('status').trim();
  req.sanitize('due_back').toDate();

  var bookinstance = new BookInstance({
    book: req.body.book,
    imprint: req.body.imprint,
    status: req.body.status,
    due_back: req.body.due_back
  });

  var errors = req.validationErrors();
  if (errors) {
    Book.find({}, 'title')
      .exec(function(err, books) {
        if (err) { return next(err); }

        res.render('bookinstance_form', {
          title: 'Create BookInstance',
          book_list: books,
          bookinstance: bookinstance,
          selected_book: bookinstance.book._id,
          errors: errors
        });

        return;
      });
  } else {
    bookinstance.save(function(err) {
      if (err) { return next(err); }

      res.redirect(bookinstance.url);
    });
  }
};

exports.bookinstance_delete_get = function(req, res, next) {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function(err, bookinstance) {
      if (err) { return next(err); }

      res.render('bookinstance_delete', {
        title: 'ID',
        bookinstance: bookinstance
      });
    });
};

exports.bookinstance_delete_post = function(req, res, next) {
  req.checkBody('bookinstanceid', 'BookInscante id must exits').notEmpty();

  BookInstance.findByIdAndRemove(req.body.bookinstanceid, function(err) {
    if (err) { return next(err); }

    res.redirect('/catalog/bookinstances');
  });
};

exports.bookinstance_update_get = function(req, res, next) {
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  async.parallel(
    {
      books: function(callback) {
        Book.find(callback);
      },

      bookinstance: function(callback) {
        BookInstance.findById(req.params.id, callback);
      }
    },

    function(err, results) {
      if (err) { return next(err); }

      res.render('bookinstance_form', {
        title: 'Update BookInstance',
        bookinstance: results.bookinstance,
        book_list: results.books
      });
    }
  );
};

exports.bookinstance_update_post = function(req, res, next) {
  req.sanitize('id').escape();
  req.sanitize('id').trim();

  req.checkBody('book', 'Book must be specified').notEmpty();
  req.checkBody('imprint', 'Imprint must be specified').notEmpty();
  req.checkBody('due_back', 'Invalid date')
    .optional({ checkFalsy: true }).isDate();

  req.sanitize('book').escape();
  req.sanitize('imprint').escape();
  req.sanitize('status').escape();
  req.sanitize('book').trim();
  req.sanitize('imprint').trim();
  req.sanitize('status').trim();
  req.sanitize('due_back').toDate();

  var bookinstance = new BookInstance({
    book: req.body.book,
    imprint: req.body.imprint,
    status: req.body.status,
    due_back: req.body.due_back,
    _id: req.params.id
  });

  var errors = req.validationErrors();
  if (errors) {
    Book.find()
      .exec(function(err, books) {
        if (err) { return next(err); }

        res.render('bookinstance_form', {
          title: 'Update BookInstance',
          bookinstance: bookinstance,
          book_list: books,
          errors: errors
        });
      });
  } else {
    BookInstance.findByIdAndUpdate(
      req.params.id,
      bookinstance,
      {},
      function(err, thebookinstance) {
        if (err) { return next(err); }

        res.redirect(thebookinstance.url);
      }
    );
  }
};
