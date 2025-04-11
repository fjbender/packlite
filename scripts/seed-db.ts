/**
 * Database seeding script for PackLite
 * 
 * This script can be used to populate the MongoDB database with sample data.
 * Useful for development, testing or initial deployment.
 * 
 * Usage:
 *   npx ts-node scripts/seed-db.ts
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/packlite';

// Import models
import { User } from '../src/lib/models/User';
import { default as Gear } from '../src/lib/models/Gear';
import { default as Trip } from '../src/lib/models/Trip';

// Sample data
async function seedDatabase() {
  console.log('Starting database seeding...');

  // Connect to MongoDB
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional, comment out if you don't want to clear data)
    await User.deleteMany({});
    await Gear.deleteMany({});
    await Trip.deleteMany({});
    console.log('Cleared existing data');

    // Create a test user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      emailVerified: new Date(),
    });
    console.log('Created test user:', user.email);

    // Create sample gear items
    const gearItems = [
      {
        userId: user._id.toString(),
        name: 'Tent - 2 Person',
        category: 'Shelter',
        weight: 1200,
        weightUnit: 'g',
        essential: true,
        condition: 'Good',
        notes: 'Lightweight backpacking tent',
      },
      {
        userId: user._id.toString(),
        name: 'Sleeping Bag',
        category: 'Sleep System',
        weight: 850,
        weightUnit: 'g',
        essential: true,
        condition: 'Excellent',
        notes: '20°F down sleeping bag',
      },
      {
        userId: user._id.toString(),
        name: 'Backpack - 55L',
        category: 'Packing',
        weight: 1800,
        weightUnit: 'g',
        essential: true,
        condition: 'Good',
      },
      {
        userId: user._id.toString(),
        name: 'Water Filter',
        category: 'Water',
        weight: 85,
        weightUnit: 'g',
        essential: true,
        condition: 'Good',
      },
      {
        userId: user._id.toString(),
        name: 'Trekking Poles',
        category: 'Accessories',
        weight: 510,
        weightUnit: 'g',
        essential: false,
        condition: 'Good',
      },
    ];

    const createdGear = await Gear.insertMany(gearItems);
    console.log(`Created ${createdGear.length} gear items`);

    // Create a sample trip
    const trip = await Trip.create({
      userId: user._id.toString(),
      name: 'Weekend Hike - Mt. Baker',
      description: 'A weekend backpacking trip to Mt. Baker wilderness.',
      startDate: new Date('2025-06-15'),
      endDate: new Date('2025-06-17'),
      location: 'Mt. Baker Wilderness, WA',
      distance: 24,
      distanceUnit: 'mi',
      status: 'planned',
      isPublic: true,
      packingList: [
        {
          gearId: createdGear[0]._id, // Tent
          isPacked: true,
          quantity: 1,
        },
        {
          gearId: createdGear[1]._id, // Sleeping Bag
          isPacked: true,
          quantity: 1,
        },
        {
          gearId: createdGear[2]._id, // Backpack
          isPacked: true,
          quantity: 1,
        },
        {
          gearId: createdGear[3]._id, // Water Filter
          isPacked: false,
          quantity: 1,
        },
      ],
    });

    console.log('Created sample trip:', trip.name);
    console.log('Database seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the database connection
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

// Run the seeding function
seedDatabase();