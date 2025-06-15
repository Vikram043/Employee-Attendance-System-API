const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

router.post('/', async (req, res) => {
  try {
    const attendance = new Attendance(req.body);
    await attendance.save();
    res.status(200).json({ message: 'Attendance recorded successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
