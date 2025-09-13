// MongoDB Data Seeding Script for Porter Saathi
// Run this script to populate your database with test data

// Connect to the database
use porter_saathi;

// Clear existing data (optional - uncomment if you want fresh data)
// db.users.deleteMany({});
// db.earnings.deleteMany({});
// db.chat_sessions.deleteMany({});
// db.otps.deleteMany({});

print("🚀 Starting Porter Saathi data seeding...");

// 1. Create Test Users
print("👥 Creating test users...");

const users = [
  {
    mobile: "9876543210",
    name: "Rajesh Kumar",
    aadhar_number: "123456789012",
    license_number: "DL1420110012345",
    vehicle_number: "MH12AB1234",
    emergency_contact: "9876543211",
    preferred_language: "hi",
    documents: {
      aadhar_card: {
        file_name: "aadhar_rajesh.jpg",
        file_url: "/uploads/aadhar_rajesh.jpg",
        file_size: 245760,
        content_type: "image/jpeg",
        uploaded_at: new Date()
      },
      driving_license: {
        file_name: "license_rajesh.jpg",
        file_url: "/uploads/license_rajesh.jpg",
        file_size: 189440,
        content_type: "image/jpeg",
        uploaded_at: new Date()
      },
      vehicle_rc: {
        file_name: "rc_rajesh.jpg",
        file_url: "/uploads/rc_rajesh.jpg",
        file_size: 156720,
        content_type: "image/jpeg",
        uploaded_at: new Date()
      },
      profile_photo: {
        file_name: "profile_rajesh.jpg",
        file_url: "/uploads/profile_rajesh.jpg",
        file_size: 98304,
        content_type: "image/jpeg",
        uploaded_at: new Date()
      }
    },
    is_verified: true,
    created_at: new Date("2024-01-15"),
    updated_at: new Date()
  },
  {
    mobile: "9123456789",
    name: "Suresh Patel",
    aadhar_number: "987654321098",
    license_number: "GJ0520110098765",
    vehicle_number: "GJ05CD5678",
    emergency_contact: "9123456788",
    preferred_language: "hi",
    documents: {
      aadhar_card: {
        file_name: "aadhar_suresh.jpg",
        file_url: "/uploads/aadhar_suresh.jpg",
        file_size: 234560,
        content_type: "image/jpeg",
        uploaded_at: new Date()
      },
      driving_license: {
        file_name: "license_suresh.jpg",
        file_url: "/uploads/license_suresh.jpg",
        file_size: 178920,
        content_type: "image/jpeg",
        uploaded_at: new Date()
      }
    },
    is_verified: true,
    created_at: new Date("2024-02-10"),
    updated_at: new Date()
  },
  {
    mobile: "8765432109",
    name: "Ramesh Singh",
    aadhar_number: "456789123456",
    license_number: "UP1420110054321",
    vehicle_number: "UP14EF9012",
    emergency_contact: "8765432108",
    preferred_language: "hi",
    documents: {},
    is_verified: false,
    created_at: new Date("2024-03-05"),
    updated_at: new Date()
  }
];

const insertedUsers = db.users.insertMany(users);
const userIds = Object.values(insertedUsers.insertedIds);
print(`✅ Created ${userIds.length} test users`);

// 2. Create Earnings Data
print("💰 Creating earnings data...");

const earningsData = [];
const today = new Date();

// Generate earnings for the last 30 days for each user
userIds.forEach((userId, userIndex) => {
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Generate realistic earnings data
    const baseRevenue = 800 + (userIndex * 200); // Different base for each user
    const revenue = baseRevenue + Math.floor(Math.random() * 800); // 800-1600 range
    const expenses = Math.floor(revenue * 0.2) + Math.floor(Math.random() * 100); // 20% + random
    const trips = Math.floor(revenue / 120) + Math.floor(Math.random() * 5); // Approx trips based on revenue
    
    earningsData.push({
      user_id: userId,
      date: date,
      revenue: revenue,
      expenses: expenses,
      trips: trips,
      net_earnings: revenue - expenses,
      created_at: date,
      updated_at: date
    });
  }
});

db.earnings.insertMany(earningsData);
print(`✅ Created ${earningsData.length} earnings records`);

// 3. Create Chat Sessions
print("💬 Creating chat sessions...");

const chatSessions = [
  {
    user_id: userIds[0],
    session_type: "guru",
    language: "hi",
    messages: [
      {
        sender: "user",
        text: "मेरी गाड़ी में कुछ समस्या है",
        timestamp: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        sender: "ai",
        text: "मैं आपकी मदद करूंगा। कृपया बताएं कि आपकी गाड़ी में क्या समस्या है?",
        timestamp: new Date(Date.now() - 3500000)
      },
      {
        sender: "user",
        text: "इंजन से अजीब आवाज आ रही है",
        timestamp: new Date(Date.now() - 3400000)
      },
      {
        sender: "ai",
        text: "यह एक गंभीर समस्या हो सकती है। कृपया तुरंत गाड़ी रोकें और नजदीकी मैकेनिक से संपर्क करें।",
        timestamp: new Date(Date.now() - 3300000)
      }
    ],
    created_at: new Date(Date.now() - 3600000),
    updated_at: new Date(Date.now() - 3300000)
  },
  {
    user_id: userIds[1],
    session_type: "general",
    language: "hi",
    messages: [
      {
        sender: "user",
        text: "आज कितनी कमाई हुई?",
        timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
      },
      {
        sender: "ai",
        text: "आज आपकी कुल कमाई ₹1,250 है। आपने 8 ट्रिप पूरी की हैं।",
        timestamp: new Date(Date.now() - 1700000)
      }
    ],
    created_at: new Date(Date.now() - 1800000),
    updated_at: new Date(Date.now() - 1700000)
  }
];

db.chat_sessions.insertMany(chatSessions);
print(`✅ Created ${chatSessions.length} chat sessions`);

// 4. Create Some Test OTPs (for testing)
print("📱 Creating test OTPs...");

const testOTPs = [
  {
    mobile: "9876543210",
    otp: "123456",
    expires_at: new Date(Date.now() + 300000), // 5 minutes from now
    created_at: new Date()
  },
  {
    mobile: "9999999999",
    otp: "654321",
    expires_at: new Date(Date.now() + 300000),
    created_at: new Date()
  }
];

db.otps.insertMany(testOTPs);
print(`✅ Created ${testOTPs.length} test OTPs`);

// 5. Display Summary
print("\n📊 Database Summary:");
print(`👥 Users: ${db.users.countDocuments()}`);
print(`💰 Earnings: ${db.earnings.countDocuments()}`);
print(`💬 Chat Sessions: ${db.chat_sessions.countDocuments()}`);
print(`📱 OTPs: ${db.otps.countDocuments()}`);
print(`📚 Tutorials: ${db.tutorials.countDocuments()}`);

print("\n🎉 Data seeding completed successfully!");
print("\n📋 Test User Credentials:");
print("Mobile: 9876543210 (Rajesh Kumar - Verified)");
print("Mobile: 9123456789 (Suresh Patel - Verified)");
print("Mobile: 8765432109 (Ramesh Singh - Not Verified)");
print("\n🔐 Test OTPs:");
print("9876543210 -> 123456");
print("9999999999 -> 654321");

print("\n🚀 You can now test the full application with real data!"); 