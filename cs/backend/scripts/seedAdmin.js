import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.model.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await Admin.findOne({ email: 'admin@institute.com' });
    if (existing) {
      console.log('⚠️  Admin already exists: admin@institute.com');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 12);

    await Admin.create({
      name: 'Institute Admin',
      email: 'admin@institute.com',
      password: hashedPassword,
    });

    console.log('✅ Admin seeded successfully');
    console.log('   Email:    admin@institute.com');
    console.log('   Password: Admin@123');
    console.log('   ⚠️  CHANGE PASSWORD after first login!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seedAdmin();
