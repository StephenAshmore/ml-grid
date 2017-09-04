let mongoose = require('mongoose');
mongoose.connect('mongodb://mongodb/jobs');

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('We have connected to the database.');
    // we're connected!
});

const jobSchema = mongoose.Schema({
    name: String,
    code: String
});
const Job = mongoose.model('Job', jobSchema);
console.log(typeof Job);
module.exports = Job;