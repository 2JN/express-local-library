var mongoose = require('mongoose');
var moment = require('moment');

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
    return '/catalog/author/' + this._id;
  });

AuthorSchema
  .virtual('date_of_birth_formatted')
  .get(function() {
    return this.date_of_birth
      ? moment(this.date_of_birth).format('YYYY-MM-DD')
      : '';
  });

AuthorSchema
  .virtual('date_of_death_formatted')
  .get(function() {
    return this.date_of_birth
      ? moment(this.date_of_death).format('YYYY-MM-DD')
      : '';
  });

AuthorSchema
  .virtual('display_date_of_birth')
  .get(function() {
    return moment(this.date_of_birth).format('MM-DD-YYYY');
  });

AuthorSchema
  .virtual('display_date_of_death')
  .get(function() {
    return moment(this.date_of_death).format('MM-DD-YYYY');
  });

module.exports = mongoose.model('Author', AuthorSchema);
