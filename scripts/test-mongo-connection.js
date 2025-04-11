/**
 * Simple MongoDB connection test script
 * Run with: node scripts/test-mongo-connection.js
 */

const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Connection URI from environment variable or default
const uri = process.env.MONGODB_URI || 'mongodb://mongodb:27017/packlite';

async function testConnection() {
  console.log(`Attempting to connect to MongoDB at: ${uri}`);

  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Successfully connected to MongoDB');

    // Get the database
    const db = client.db('packlite');
    
    // List collections to verify connection
    const collections = await db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    console.log('MongoDB connection test completed successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  } finally {
    // Close the connection
    await client.close();
  }
}

// Run the test
testConnection();