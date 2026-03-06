import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from './models/Admin.model.js';
import Course from './models/Course.model.js';
import Batch from './models/Batch.model.js';
import Student from './models/Student.model.js';
import Payment from './models/Payment.model.js';

const MONGO_URI = process.env.MONGO_URI;

const courses = [
  { name: 'Mathematics (11th-12th)', duration: '12 Months', totalFees: 36000, description: 'Complete JEE/Board-level Maths covering Calculus, Algebra, Geometry, Trigonometry.' },
  { name: 'Physics (11th-12th)', duration: '12 Months', totalFees: 36000, description: 'Mechanics, Optics, Electromagnetism, Modern Physics for JEE & Boards.' },
  { name: 'Chemistry (11th-12th)', duration: '12 Months', totalFees: 32000, description: 'Organic, Inorganic, Physical Chemistry with lab-style problem solving.' },
  { name: 'Biology (NEET)', duration: '12 Months', totalFees: 38000, description: 'NEET-focused Biology covering Botany, Zoology, Genetics, Ecology.' },
  { name: 'English (9th-10th)', duration: '6 Months', totalFees: 18000, description: 'Grammar, Literature, Creative Writing & Board exam preparation.' },
  { name: 'PCM Combo (JEE)', duration: '24 Months', totalFees: 85000, description: 'Complete Physics + Chemistry + Maths for JEE Main & Advanced.' },
  { name: 'NEET Crash Course', duration: '4 Months', totalFees: 25000, description: 'Intensive revision with daily tests, doubt sessions, and mock exams.' },
  { name: 'Foundation (8th-9th)', duration: '12 Months', totalFees: 22000, description: 'Build strong fundamentals in Science & Maths for future competitive exams.' },
];

const batchTemplates = [
  { name: 'Morning Alpha', timing: '7:00 AM - 9:00 AM' },
  { name: 'Morning Beta', timing: '9:30 AM - 11:30 AM' },
  { name: 'Afternoon Gamma', timing: '12:00 PM - 2:00 PM' },
  { name: 'Evening Delta', timing: '4:00 PM - 6:00 PM' },
  { name: 'Evening Omega', timing: '6:30 PM - 8:30 PM' },
];

const teachers = [
  'Dr. Rajesh Kumar', 'Mrs. Priya Sharma', 'Mr. Ankit Verma', 'Dr. Sunita Gupta',
  'Mr. Deepak Singh', 'Mrs. Kavita Mishra', 'Mr. Rohit Patel', 'Dr. Neha Agarwal',
];

const firstNames = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Krishna',
  'Ishaan', 'Ananya', 'Diya', 'Myra', 'Sara', 'Aditi', 'Kiara', 'Riya',
  'Arnav', 'Dhruv', 'Kabir', 'Ritesh', 'Simran', 'Pooja', 'Neha', 'Tanvi',
  'Rohan', 'Karan', 'Priya', 'Sneha', 'Aisha', 'Varun', 'Rahul', 'Nisha',
  'Mohit', 'Sakshi', 'Kartik', 'Trisha', 'Harsh', 'Divya', 'Kunal', 'Megha',
];

const lastNames = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Kumar', 'Mishra', 'Agarwal',
  'Joshi', 'Chauhan', 'Yadav', 'Rajput', 'Tiwari', 'Pandey', 'Dubey', 'Saxena',
  'Reddy', 'Nair', 'Iyer', 'Das', 'Roy', 'Kapoor', 'Malhotra', 'Banerjee',
];

const addresses = [
  '12, MG Road, Bhopal', '45 Nehru Nagar, Indore', '78 Civil Lines, Jaipur',
  '23 Gandhi Colony, Lucknow', '56 Lajpat Nagar, Delhi', '90 Saket, New Delhi',
  '34 Koregaon Park, Pune', '67 Anna Nagar, Chennai', '11 Salt Lake, Kolkata',
  '89 Jubilee Hills, Hyderabad', '22 Sector 15, Noida', '55 Arera Colony, Bhopal',
  '', '', '', // some students without address
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randPhone = () => `${randInt(6, 9)}${String(randInt(100000000, 999999999)).padStart(9, '0')}`;

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await Promise.all([
    Admin.deleteMany({}),
    Payment.deleteMany({}),
    Student.deleteMany({}),
    Batch.deleteMany({}),
    Course.deleteMany({}),
  ]);
  console.log('✅ Cleared\n');

  // 1. Admin
  console.log('👤 Creating admin...');
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await Admin.create({ name: 'Institute Admin', email: 'admin@cidms.com', password: hashedPassword });
  console.log(`   ✅ admin@cidms.com / admin123\n`);

  // 2. Courses
  console.log('📚 Creating courses...');
  const createdCourses = await Course.insertMany(courses);
  console.log(`   ✅ ${createdCourses.length} courses created\n`);

  // 3. Batches (2-3 per course)
  console.log('📋 Creating batches...');
  const batchDocs = [];
  for (const course of createdCourses) {
    const numBatches = randInt(2, 3);
    const shuffledBatches = [...batchTemplates].sort(() => Math.random() - 0.5).slice(0, numBatches);
    for (const bt of shuffledBatches) {
      batchDocs.push({
        name: `${course.name.split('(')[0].trim()} — ${bt.name}`,
        course: course._id,
        teacher: rand(teachers),
        startDate: new Date(2026, randInt(0, 2), randInt(1, 28)),
        endDate: new Date(2026, randInt(9, 11), randInt(1, 28)),
        timing: bt.timing,
      });
    }
  }
  const createdBatches = await Batch.insertMany(batchDocs);
  console.log(`   ✅ ${createdBatches.length} batches created\n`);

  // 4. Students (40 students)
  console.log('🎓 Creating students...');
  const usedPhones = new Set();
  const usedEmails = new Set();
  const studentDocs = [];

  for (let i = 0; i < 40; i++) {
    const firstName = rand(firstNames);
    const lastName = rand(lastNames);
    const name = `${firstName} ${lastName}`;

    let phone;
    do { phone = randPhone(); } while (usedPhones.has(phone));
    usedPhones.add(phone);

    const hasEmail = Math.random() > 0.2; // 80% have email
    let email = '';
    if (hasEmail) {
      let e;
      do { e = `${firstName.toLowerCase()}${randInt(1, 999)}@gmail.com`; } while (usedEmails.has(e));
      usedEmails.add(e);
      email = e;
    }

    const course = rand(createdCourses);
    const courseBatches = createdBatches.filter(b => b.course.toString() === course._id.toString());
    const batch = rand(courseBatches);
    const totalFees = course.totalFees;
    const feePercentage = rand([0, 0, 0.25, 0.5, 0.5, 0.75, 1, 1]);
    const feesPaid = Math.round(totalFees * feePercentage);

    studentDocs.push({
      name, phone, email, address: rand(addresses),
      course: course._id, batch: batch._id,
      admissionDate: new Date(2026, randInt(0, 2), randInt(1, 28)),
      totalFees, feesPaid,
      status: rand(['active', 'active', 'active', 'active', 'inactive']),
    });
  }
  const createdStudents = await Student.insertMany(studentDocs);
  console.log(`   ✅ ${createdStudents.length} students created\n`);

  // 5. Payments (for students with feesPaid > 0)
  console.log('💰 Creating payment records...');
  const paymentDocs = [];
  for (const student of createdStudents) {
    if (student.feesPaid > 0) {
      const numPayments = randInt(1, 3);
      let remaining = student.feesPaid;
      for (let j = 0; j < numPayments && remaining > 0; j++) {
        const amount = j === numPayments - 1 ? remaining : Math.round(remaining * rand([0.3, 0.4, 0.5, 0.6]));
        remaining -= amount;
        paymentDocs.push({
          student: student._id,
          amount,
          paymentMode: rand(['Cash', 'UPI', 'Bank Transfer']),
          paymentDate: new Date(2026, randInt(0, 2), randInt(1, 28)),
          notes: rand(['', '', 'Partial payment', 'First installment', 'Final payment', 'Monthly fee']),
          recordedBy: admin._id,
        });
      }
    }
  }
  // Use create() to trigger post-save hooks... but students already have feesPaid set
  // So just insertMany to avoid double-counting
  await Payment.insertMany(paymentDocs);
  console.log(`   ✅ ${paymentDocs.length} payments created\n`);

  console.log('═══════════════════════════════════');
  console.log('🎉 SEED COMPLETE!');
  console.log('═══════════════════════════════════');
  console.log(`   📚 ${createdCourses.length} courses`);
  console.log(`   📋 ${createdBatches.length} batches`);
  console.log(`   🎓 ${createdStudents.length} students`);
  console.log(`   💰 ${paymentDocs.length} payments`);
  console.log(`   👤 1 admin (admin@cidms.com / admin123)`);
  console.log('═══════════════════════════════════\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
