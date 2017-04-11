var mongoose = require('mongoose');

var AuthorSchema = mongoose.Schema({
  first_name: {type: String, required: true, max: 100},
  family_name: {type: String, required: true, max: 100},
  date_of_birth: {type: Date},
  date_of_death: {type: Date}
});

AuthorSchema
  .virtual('name')
  .get(function() {
    return this.family_name + ', ' + this.first_name;
  });

AuthorSchema
  .virtual('url')
  .get(function() {
    return '/catalag/author/' + this._id;
  });

module.exports = mongoose.model('Author', AuthorSchema);
