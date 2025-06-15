const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  date: Date,
  status: String, // "Present", "Absent", "Late", "Leave"
});

module.exports = mongoose.model('Attendance', attendanceSchema);
