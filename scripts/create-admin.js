const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load MongoDB connection
const dbConfig = require('../BACKEND/src/config/dbConfig');

// Create admin user model schema (matching the User model in the application)
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    role: String,
    isSubAdmin: Boolean,
    permissions: [String],
    createdBy: mongoose.Schema.Types.ObjectId,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: Boolean,
    lastLogin: Date,
    loginAttempts: Number,
    accountLocked: Boolean,
    lockUntil: Date
  },
  {
    timestamps: true
  }
);

// Create a model
const User = mongoose.model('User', UserSchema);

// Admin user data
const adminData = {
  name: 'Admin User',
  email: 'admin@company.com',
  password: '$2a$12$S0XZLRxjDkyaagN3z97hE.yILGi.eZnOPET/ZlmsfhL9GBL.0WDWK', // Admin@123456
  role: 'Admin',
  isSubAdmin: false,
  permissions: [],
  active: true,
  loginAttempts: 0,
  accountLocked: false
};

// Connect to database
const mongoURI = dbConfig.getMongoURI();
console.log(`Connecting to MongoDB at ${mongoURI}...`);

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('MongoDB Connected');
  
  try {
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists! Skipping creation.');
    } else {
      // Create new admin
      const admin = await User.create(adminData);
      console.log('Admin user created successfully:');
      console.log(`Name: ${admin.name}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Password: Admin@123456 (pre-hashed in the script)`);
      console.log(`Role: ${admin.role}`);
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
  
  // Close connection
  mongoose.connection.close();
  console.log('Connection closed');
})
.catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
}); 