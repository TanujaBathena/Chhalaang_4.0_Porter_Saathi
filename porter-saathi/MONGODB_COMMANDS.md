# MongoDB Commands for Porter Saathi

This guide contains essential MongoDB commands for managing the Porter Saathi database.

## 🚀 Quick Start

### Start MongoDB with Docker
```bash
colima start
cd backend
docker-compose up -d mongodb
```

### Stop MongoDB
```bash
docker-compose down
```

## 📋 Basic MongoDB Commands

### Connect to MongoDB
```bash
# Using Docker
docker-compose exec mongodb mongosh -u admin -p password123 --authenticationDatabase admin

# Or directly (if MongoDB is running locally)
mongosh mongodb://admin:password123@localhost:27017/porter_saathi?authSource=admin
```

### Switch to Porter Saathi Database
```javascript
use porter_saathi
```

## 🔍 View Data

### List All Collections
```javascript
show collections
```

### View Users
```javascript
db.users.find().pretty()
```

### View OTPs
```javascript
db.otps.find().pretty()
```

### View Tutorials
```javascript
db.tutorials.find().pretty()
```

### View Earnings
```javascript
db.earnings.find().pretty()
```

### View Chat Sessions
```javascript
db.chat_sessions.find().pretty()
```

## 🧹 Clean Up Data

### Delete All OTPs (expired ones)
```javascript
db.otps.deleteMany({})
```

### Delete All Users
```javascript
db.users.deleteMany({})
```

### Delete All Earnings
```javascript
db.earnings.deleteMany({})
```

### Delete All Chat Sessions
```javascript
db.chat_sessions.deleteMany({})
```

## 🔧 Useful Queries

### Find User by Mobile
```javascript
db.users.findOne({mobile: "9999999999"})
```

### Find Valid OTPs
```javascript
db.otps.find({expires_at: {$gt: new Date()}})
```

### Count Total Users
```javascript
db.users.countDocuments()
```

### Find Recent Earnings
```javascript
db.earnings.find().sort({created_at: -1}).limit(10)
```

### Find Chat History for User
```javascript
db.chat_sessions.find({user_id: ObjectId("USER_ID_HERE")})
```

## 📊 Database Status

### Check Database Stats
```javascript
db.stats()
```

### Check Collection Sizes
```javascript
db.users.stats()
db.tutorials.stats()
db.earnings.stats()
```

## 🔐 User Management

### Create Test User
```javascript
db.users.insertOne({
  mobile: "1234567890",
  name: "Test User",
  aadhar_number: "123456789012",
  license_number: "DL1234567890",
  vehicle_number: "MH01AB1234",
  emergency_contact: "9876543210",
  is_verified: false,
  created_at: new Date(),
  updated_at: new Date()
})
```

### Update User Verification Status
```javascript
db.users.updateOne(
  {mobile: "1234567890"},
  {$set: {is_verified: true, updated_at: new Date()}}
)
```

## 🗑️ Reset Database

### Drop Entire Database (⚠️ Use with caution!)
```javascript
use porter_saathi
db.dropDatabase()
```

### Recreate Collections
```javascript
// The backend will automatically recreate collections when it runs
// Just restart your Go backend: go run main.go
```

## 🐛 Troubleshooting

### Check MongoDB Connection
```bash
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### View MongoDB Logs
```bash
docker-compose logs mongodb
```

### Restart MongoDB
```bash
docker-compose restart mongodb
```

## 📝 Environment Variables

Make sure your `.env` file has:
```env
MONGODB_URI=mongodb://admin:password123@mongodb:27017/porter_saathi?authSource=admin
```

For local development:
```env
MONGODB_URI=mongodb://admin:password123@localhost:27017/porter_saathi?authSource=admin
```

## 🔄 Backup & Restore

### Backup Database
```bash
docker-compose exec mongodb mongodump -u admin -p password123 --authenticationDatabase admin --db porter_saathi --out /backup
```

### Restore Database
```bash
docker-compose exec mongodb mongorestore -u admin -p password123 --authenticationDatabase admin --db porter_saathi /backup/porter_saathi
```

---

## 🚀 Quick Development Workflow

1. **Start MongoDB**: `docker-compose up -d mongodb`
2. **Start Backend**: `go run main.go`
3. **View Logs**: Check terminal for backend logs
4. **Test API**: Use curl or frontend
5. **Check Data**: Connect to MongoDB and query collections
6. **Clean Up**: Delete test data when needed

---

**Note**: Replace `USER_ID_HERE` with actual ObjectId values when running queries. 