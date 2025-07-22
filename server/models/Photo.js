const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filePath: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  genderFilter: { type: String, enum: ['male', 'female', 'other', 'all'], required: true },
  ageFilter: { type: String, enum: ['under18', '18-25', '26-35', '36-50', 'over50', 'all'], required: true },
  isEvaluatable: { type: Boolean, default: false },
  uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Photo', photoSchema);
