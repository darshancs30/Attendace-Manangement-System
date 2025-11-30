import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleared existing data');

    // Create Manager
    const manager = await User.create({
      name: 'John Manager',
      email: 'manager@company.com',
      password: 'manager123',
      role: 'manager',
      employeeId: 'EMP000',
      department: 'Management',
    });
    console.log('Created manager:', manager.email);

    // Create Employees
    const employees = await User.create([
      {
        name: 'Alice Johnson',
        email: 'alice@company.com',
        password: 'employee123',
        role: 'employee',
        employeeId: 'EMP001',
        department: 'Engineering',
      },
      {
        name: 'Bob Smith',
        email: 'bob@company.com',
        password: 'employee123',
        role: 'employee',
        employeeId: 'EMP002',
        department: 'Engineering',
      },
      {
        name: 'Carol Williams',
        email: 'carol@company.com',
        password: 'employee123',
        role: 'employee',
        employeeId: 'EMP003',
        department: 'Sales',
      },
      {
        name: 'David Brown',
        email: 'david@company.com',
        password: 'employee123',
        role: 'employee',
        employeeId: 'EMP004',
        department: 'Sales',
      },
      {
        name: 'Eva Davis',
        email: 'eva@company.com',
        password: 'employee123',
        role: 'employee',
        employeeId: 'EMP005',
        department: 'HR',
      },
    ]);
    console.log('Created employees:', employees.length);

    // Create sample attendance data for the last 30 days
    const today = new Date();
    const attendanceRecords = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }

      for (const employee of employees) {
        // Randomly decide if employee was present (80% chance)
        const isPresent = Math.random() > 0.2;

        if (isPresent) {
          // Check-in time between 8:00 AM and 10:00 AM
          const checkInHour = 8 + Math.floor(Math.random() * 2);
          const checkInMinute = Math.floor(Math.random() * 60);
          const checkInTime = new Date(date);
          checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

          // Determine if late (after 9:30 AM)
          let status = 'present';
          if (checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 30)) {
            status = 'late';
          }

          // Check-out time between 5:00 PM and 7:00 PM
          const checkOutHour = 17 + Math.floor(Math.random() * 2);
          const checkOutMinute = Math.floor(Math.random() * 60);
          const checkOutTime = new Date(date);
          checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0);

          attendanceRecords.push({
            userId: employee._id,
            date: date,
            checkInTime: checkInTime,
            checkOutTime: checkOutTime,
            status: status,
          });
        } else {
          // Absent
          attendanceRecords.push({
            userId: employee._id,
            date: date,
            status: 'absent',
          });
        }
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log('Created attendance records:', attendanceRecords.length);

    console.log('\n=== Seed Data Created Successfully ===');
    console.log('\nManager Login:');
    console.log('Email: manager@company.com');
    console.log('Password: manager123');
    console.log('\nEmployee Login (any employee):');
    console.log('Email: alice@company.com (or bob@company.com, etc.)');
    console.log('Password: employee123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seed data error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedData();

