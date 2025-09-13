// MongoDB initialization script
db = db.getSiblingDB('porter_saathi');

// Create collections with indexes
db.createCollection('users');
db.createCollection('earnings');
db.createCollection('chat_sessions');
db.createCollection('tutorials');
db.createCollection('otps');

// Create indexes for better performance
db.users.createIndex({ "mobile": 1 }, { unique: true });
db.users.createIndex({ "aadhar_number": 1 });
db.users.createIndex({ "license_number": 1 });

db.earnings.createIndex({ "user_id": 1, "date": -1 });

db.chat_sessions.createIndex({ "user_id": 1, "created_at": -1 });

db.tutorials.createIndex({ "category": 1 });

db.otps.createIndex({ "mobile": 1 });
db.otps.createIndex({ "expires_at": 1 }, { expireAfterSeconds: 0 });

print('Database initialized successfully!'); 