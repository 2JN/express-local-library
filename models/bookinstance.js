var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var BookInstanceSchema = Schema({
  book: {type: Schema.ObjectId, ref: 'Book', rquired: true},
  imprint: {type: String, required: true},
  status: {
    type: String,
    required: true,
    enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
    default: 'Maintenance'
  },
  due_back: {type: Date, default: Date.now}
});

BookInstanceSchema
  .virtual('url')
  .get(function() {
    return '/catalog/bookinstance/' + this._id;
  });

BookInstanceSchema
  .virtual('due_back_formatted')
  .get(function() {
    return moment(this.due_back).format('MMMM Do, YYYY');
  });

BookInstanceSchema
  .virtual('display_due_back')
  .get(function() {
    return moment(this.due_back).format('MM-DD-YYYY');
  });

module.exports = mongoose.model('BookInstance', BookInstanceSchema);
