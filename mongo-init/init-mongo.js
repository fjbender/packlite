// MongoDB database initialization script
// This script runs when the MongoDB container is created for the first time

db = db.getSiblingDB('packlite');

// Create collections with schema validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'Full name of the user'
        },
        email: {
          bsonType: 'string',
          description: 'Email address of the user'
        },
        password: {
          bsonType: 'string',
          description: 'Hashed password'
        },
        image: {
          bsonType: 'string',
          description: 'URL to user avatar'
        },
        emailVerified: {
          bsonType: 'date',
          description: 'Date when the email was verified'
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('gear', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'name', 'category', 'weight', 'weightUnit'],
      properties: {
        userId: {
          bsonType: 'string',
          description: 'User ID who owns this gear'
        },
        name: {
          bsonType: 'string',
          description: 'Name of the gear item'
        },
        category: {
          bsonType: 'string',
          description: 'Category of the gear'
        },
        weight: {
          bsonType: 'number',
          description: 'Weight of the gear'
        },
        weightUnit: {
          enum: ['g', 'oz'],
          description: 'Unit of weight measurement'
        },
        essential: {
          bsonType: 'bool',
          description: 'Whether the gear is essential'
        },
        image: {
          bsonType: 'string',
          description: 'URL to gear image'
        },
        notes: {
          bsonType: 'string',
          description: 'Additional notes about the gear'
        },
        condition: {
          enum: ['Excellent', 'Good', 'Fair', 'Poor'],
          description: 'Condition of the gear'
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('trips', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'name', 'startDate', 'endDate', 'status'],
      properties: {
        userId: {
          bsonType: 'string',
          description: 'User ID who owns this trip'
        },
        name: {
          bsonType: 'string',
          description: 'Name of the trip'
        },
        description: {
          bsonType: 'string',
          description: 'Description of the trip'
        },
        startDate: {
          bsonType: 'date',
          description: 'Start date of the trip'
        },
        endDate: {
          bsonType: 'date',
          description: 'End date of the trip'
        },
        location: {
          bsonType: 'string',
          description: 'Location of the trip'
        },
        distance: {
          bsonType: 'number',
          description: 'Distance of the trip'
        },
        distanceUnit: {
          enum: ['mi', 'km'],
          description: 'Unit of distance measurement'
        },
        packingList: {
          bsonType: 'array',
          description: 'List of gear items for the trip',
          items: {
            bsonType: 'object',
            required: ['gearId', 'isPacked', 'quantity'],
            properties: {
              gearId: {
                bsonType: 'objectId',
                description: 'Reference to a gear item'
              },
              isPacked: {
                bsonType: 'bool',
                description: 'Whether the gear is packed'
              },
              quantity: {
                bsonType: 'int',
                minimum: 1,
                description: 'Quantity of this gear item'
              }
            }
          }
        },
        status: {
          enum: ['planned', 'in-progress', 'completed', 'cancelled'],
          description: 'Status of the trip'
        },
        notes: {
          bsonType: 'string',
          description: 'Additional notes about the trip'
        },
        totalWeight: {
          bsonType: 'number',
          description: 'Total weight of all packed gear'
        },
        isPublic: {
          bsonType: 'bool',
          description: 'Whether the trip is visible to other users'
        },
        createdAt: {
          bsonType: 'date'
        },
        updatedAt: {
          bsonType: 'date'
        }
      }
    }
  }
});

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.gear.createIndex({ "userId": 1, "category": 1 });
db.trips.createIndex({ "userId": 1, "status": 1 });
db.trips.createIndex({ "userId": 1, "startDate": -1 });
db.trips.createIndex({ "isPublic": 1, "status": 1 }, { sparse: true });

print('MongoDB initialization completed successfully');