# MongoDB Query Commands Reference

This file contains all the commands to check your Porter Saathi database details.

## 🔗 Connection Commands

### Connect to MongoDB Shell
```bash
# Interactive shell
docker-compose exec mongodb mongosh -u admin -p password123 --authenticationDatabase admin

# Switch to database (inside shell)
use porter_saathi
```

### One-line Commands (no shell required)
```bash
# Template
docker-compose exec -T mongodb mongosh -u admin -p password123 --authenticationDatabase admin porter_saathi --eval "YOUR_QUERY_HERE"
```

## 📊 Overview Commands

### Database Summary
```javascript
// Inside MongoDB shell
print("👥 Users: " + db.users.countDocuments());
print("💰 Earnings: " + db.earnings.countDocuments());
print("💬 Chats: " + db.chat_sessions.countDocuments());
print("📱 OTPs: " + db.otps.countDocuments());
print("📚 Tutorials: " + db.tutorials.countDocuments());
```

### Collections List
```javascript
show collections
show dbs
```

## 👥 User Queries

### Basic User Info
```javascript
// All users summary
db.users.find({}, {name: 1, mobile: 1, is_verified: 1})

// Complete user details
db.users.find().forEach(printjson)

// Specific user
db.users.findOne({mobile: "9876543210"})

// Verified users only
db.users.find({is_verified: true})

// Users with documents
db.users.find({"documents.aadhar_card": {$exists: true}})
```

### User Statistics
```javascript
// Count by verification status
db.users.countDocuments({is_verified: true})
db.users.countDocuments({is_verified: false})

// Users by language
db.users.find({}, {name: 1, preferred_language: 1})
```

## 💰 Earnings Queries

### Basic Earnings Data
```javascript
// Sample earnings
db.earnings.find().limit(5).forEach(printjson)

// Recent earnings
db.earnings.find().sort({date: -1}).limit(10)

// Earnings for specific user
db.earnings.find({user_id: ObjectId("68c50cf0a888ebe7814f87fe")})
```

### Earnings Analytics
```javascript
// Total earnings by user
db.earnings.aggregate([
  {$group: {
    _id: "$user_id",
    totalRevenue: {$sum: "$revenue"},
    totalExpenses: {$sum: "$expenses"},
    totalTrips: {$sum: "$trips"},
    netEarnings: {$sum: "$net_earnings"},
    avgDaily: {$avg: "$net_earnings"}
  }}
])

// Daily earnings summary
db.earnings.aggregate([
  {$group: {
    _id: {$dateToString: {format: "%Y-%m-%d", date: "$date"}},
    totalRevenue: {$sum: "$revenue"},
    totalTrips: {$sum: "$trips"},
    userCount: {$addToSet: "$user_id"}
  }},
  {$sort: {_id: -1}},
  {$limit: 7}
])
```

### Date-based Earnings
```javascript
// Last 7 days
var sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
db.earnings.find({date: {$gte: sevenDaysAgo}})

// Today's earnings
var today = new Date();
today.setHours(0,0,0,0);
db.earnings.find({date: {$gte: today}})

// This month
var startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
db.earnings.find({date: {$gte: startOfMonth}})
```

## 💬 Chat Queries

### Basic Chat Data
```javascript
// All chat sessions
db.chat_sessions.find().forEach(printjson)

// Recent chats
db.chat_sessions.find().sort({created_at: -1})

// Chat by session type
db.chat_sessions.find({session_type: "guru"})
db.chat_sessions.find({session_type: "general"})
```

### Chat Analytics
```javascript
// Message count per session
db.chat_sessions.aggregate([
  {$project: {
    user_id: 1,
    session_type: 1,
    language: 1,
    messageCount: {$size: "$messages"},
    created_at: 1
  }}
])

// Chats with user details
db.chat_sessions.aggregate([
  {$lookup: {
    from: "users",
    localField: "user_id",
    foreignField: "_id",
    as: "user"
  }},
  {$unwind: "$user"},
  {$project: {
    userName: "$user.name",
    sessionType: 1,
    messageCount: {$size: "$messages"},
    language: 1,
    created_at: 1
  }}
])
```

## 📱 OTP Queries

### Basic OTP Data
```javascript
// All OTPs
db.otps.find().forEach(printjson)

// Active OTPs only
db.otps.find({expires_at: {$gt: new Date()}})

// OTPs for specific mobile
db.otps.find({mobile: "9999999999"})

// Expired OTPs
db.otps.find({expires_at: {$lt: new Date()}})
```

### OTP Statistics
```javascript
// Count active vs expired
db.otps.countDocuments({expires_at: {$gt: new Date()}})
db.otps.countDocuments({expires_at: {$lt: new Date()}})

// Recent OTP activity
db.otps.find().sort({created_at: -1}).limit(10)
```

## 📚 Tutorial Queries

### Basic Tutorial Data
```javascript
// All tutorials
db.tutorials.find().forEach(printjson)

// Tutorial categories
db.tutorials.distinct("category")

// Tutorials by category
db.tutorials.find({category: "challan"})
db.tutorials.find({category: "insurance"})
```

### Tutorial Content
```javascript
// English titles only
db.tutorials.find({}, {category: 1, "title.en": 1})

// Hindi content
db.tutorials.find({}, {category: 1, "title.hi": 1, "steps.hi": 1})

// All languages for specific tutorial
db.tutorials.findOne({category: "challan"})
```

## 🔍 Advanced Queries

### Cross-Collection Analytics
```javascript
// User activity summary
db.users.aggregate([
  {$lookup: {
    from: "earnings",
    localField: "_id",
    foreignField: "user_id",
    as: "earnings"
  }},
  {$lookup: {
    from: "chat_sessions",
    localField: "_id",
    foreignField: "user_id",
    as: "chats"
  }},
  {$project: {
    name: 1,
    mobile: 1,
    is_verified: 1,
    earningsCount: {$size: "$earnings"},
    chatCount: {$size: "$chats"},
    totalEarnings: {$sum: "$earnings.net_earnings"}
  }}
])
```

### Data Validation Queries
```javascript
// Users without earnings
db.users.aggregate([
  {$lookup: {
    from: "earnings",
    localField: "_id",
    foreignField: "user_id",
    as: "earnings"
  }},
  {$match: {"earnings": {$size: 0}}},
  {$project: {name: 1, mobile: 1}}
])

// Earnings without valid users
db.earnings.aggregate([
  {$lookup: {
    from: "users",
    localField: "user_id",
    foreignField: "_id",
    as: "user"
  }},
  {$match: {"user": {$size: 0}}}
])
```

## 🚀 Quick Commands

### One-Line Database Overview
```bash
docker-compose exec -T mongodb mongosh -u admin -p password123 --authenticationDatabase admin porter_saathi --eval "
print('=== DATABASE OVERVIEW ===');
print('👥 Users: ' + db.users.countDocuments());
print('💰 Earnings: ' + db.earnings.countDocuments());
print('💬 Chats: ' + db.chat_sessions.countDocuments());
print('📱 OTPs: ' + db.otps.countDocuments());
print('📚 Tutorials: ' + db.tutorials.countDocuments());
"
```

### One-Line User Summary
```bash
docker-compose exec -T mongodb mongosh -u admin -p password123 --authenticationDatabase admin porter_saathi --eval "db.users.find({}, {name: 1, mobile: 1, is_verified: 1})"
```

### One-Line Recent Activity
```bash
docker-compose exec -T mongodb mongosh -u admin -p password123 --authenticationDatabase admin porter_saathi --eval "
print('=== RECENT ACTIVITY ===');
print('Recent Earnings:');
db.earnings.find().sort({date: -1}).limit(3).forEach(e => print('  ' + e.date.toISOString().split('T')[0] + ': ₹' + e.net_earnings));
print('Recent Chats:');
db.chat_sessions.find().sort({created_at: -1}).limit(2).forEach(c => print('  ' + c.session_type + ' (' + c.language + ')'));
"
```

## 📝 Useful Tips

### Formatting Output
```javascript
// Pretty print
db.collection.find().pretty()

// Limit results
db.collection.find().limit(5)

// Sort results
db.collection.find().sort({created_at: -1})

// Count only
db.collection.countDocuments()
```

### Field Selection
```javascript
// Include specific fields
db.users.find({}, {name: 1, mobile: 1})

// Exclude specific fields
db.users.find({}, {_id: 0, name: 1, mobile: 1})

// Nested field access
db.users.find({}, {"documents.aadhar_card.file_name": 1})
```

### Date Queries
```javascript
// Today
var today = new Date();
today.setHours(0,0,0,0);

// Yesterday
var yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
yesterday.setHours(0,0,0,0);

// Last week
var lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() - 7);
```

---

## 🎯 Most Used Commands

```javascript
// Quick health check
db.users.countDocuments()
db.earnings.countDocuments()
db.chat_sessions.countDocuments()

// View sample data
db.users.findOne()
db.earnings.findOne()
db.chat_sessions.findOne()

// Check specific user
db.users.findOne({mobile: "9876543210"})
db.earnings.find({user_id: ObjectId("USER_ID")}).limit(5)
```

Save this file and use it as your MongoDB query reference! 