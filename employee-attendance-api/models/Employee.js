const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: String,
  department: String,
  position: String,
  joiningDate: Date,
});

module.exports = mongoose.model('Employee', employeeSchema);
