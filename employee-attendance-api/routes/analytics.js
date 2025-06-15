const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const mongoose = require('mongoose');

// 1. Total attendance per employee
router.get('/total-attendance', async (req, res) => {
  try {
    const result = await Attendance.aggregate([
      { $match: { status: 'Present' } },
      {
        $group: {
          _id: '$employeeId',
          totalPresent: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: '$employee' },
      {
        $project: {
          name: '$employee.name',
          department: '$employee.department',
          totalPresent: 1,
        },
      },
    ]);

    if (result.length === 0) return res.status(200).json({ message: 'No data found' });
    res.status(200).json(result);
  } catch {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// 2. Attendance history of a specific employee
router.get('/attendance-history/:id', async (req, res) => {
  try {
    const employeeId = new mongoose.Types.ObjectId(req.params.id);
    const result = await Attendance.find({ employeeId }).sort({ date: -1 });

    if (result.length === 0) return res.status(200).json({ message: 'No data found' });
    res.status(200).json(result);
  } catch {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// 3. Employees with over 95% attendance
router.get('/top-attendees', async (req, res) => {
  try {
    const result = await Attendance.aggregate([
      {
        $group: {
          _id: '$employeeId',
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Present'] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          attendancePercentage: {
            $multiply: [
              { $divide: ['$presentDays', '$totalDays'] },
              100,
            ],
          },
        },
      },
      {
        $match: {
          attendancePercentage: { $gte: 95 },
        },
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: '$employee' },
      {
        $project: {
          name: '$employee.name',
          department: '$employee.department',
          attendancePercentage: 1,
        },
      },
    ]);

    if (result.length === 0) return res.status(200).json({ message: 'No data found' });
    res.status(200).json(result);
  } catch {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// 4. Employees absent more than 5 times this month
router.get('/absent-employees', async (req, res) => {
  try {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const result = await Attendance.aggregate([
      {
        $match: {
          status: 'Absent',
          date: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: '$employeeId',
          absentCount: { $sum: 1 },
        },
      },
      { $match: { absentCount: { $gt: 5 } } },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: '$employee' },
      {
        $project: {
          name: '$employee.name',
          department: '$employee.department',
          absentCount: 1,
        },
      },
    ]);

    if (result.length === 0) return res.status(200).json({ message: 'No data found' });
    res.status(200).json(result);
  } catch {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// 5. Recent 5 attendance records per employee
router.get('/recent-attendance', async (req, res) => {
  try {
    const employees = await Employee.find({});
    const result = [];

    for (const emp of employees) {
      const records = await Attendance.find({ employeeId: emp._id })
        .sort({ date: -1 })
        .limit(5);
      result.push({
        employee: emp.name,
        department: emp.department,
        recentAttendance: records,
      });
    }

    if (result.length === 0) return res.status(200).json({ message: 'No data found' });
    res.status(200).json(result);
  } catch {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
