const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true },
  title: { type: String, default: '' },
  isEvaluatable: { type: Boolean, default: false },
  genderFilter: { type: String, enum: ['male', 'female', 'other', 'all'], default: 'all' },
  ageFilter: { type: String, enum: ['under18', '18-25', '26-35', '36-50', 'over50', 'all'], default: 'all' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Photo', PhotoSchema);
