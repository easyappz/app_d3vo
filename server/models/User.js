const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  age: { type: Number, required: true },
  points: { type: Number, default: 0 },
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Date, default: null }
});

module.exports = mongoose.model('User', userSchema);
