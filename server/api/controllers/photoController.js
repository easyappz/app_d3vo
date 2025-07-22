const Photo = require('../../models/Photo');
const User = require('../../models/User');
const Rating = require('../../models/Rating');

exports.uploadPhoto = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, genderFilter, ageFilter } = req.body;
    const url = req.file ? `/uploads/${req.file.filename}` : '';
    if (!url) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const photo = new Photo({ userId, url, title, genderFilter, ageFilter });
    await photo.save();
    res.status(201).json({ photo });
  } catch (error) {
    res.status(500).json({ error: 'Photo upload failed: ' + error.message });
  }
};

exports.getPhotosForEvaluation = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { gender, age } = req.query;
    const user = await User.findById(userId);
    let filter = { isEvaluatable: true, userId: { $ne: userId } };
    if (gender && gender !== 'all') {
      filter.genderFilter = { $in: [gender, 'all'] };
    }
    if (age && age !== 'all') {
      filter.ageFilter = { $in: [age, 'all'] };
    }
    const photos = await Photo.find(filter).populate('userId');
    res.json({ photos });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch photos for evaluation: ' + error.message });
  }
};

exports.addToEvaluatable = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { photoId } = req.body;
    const user = await User.findById(userId);
    if (user.points <= 0) {
      return res.status(400).json({ error: 'Not enough points to add photo for evaluation' });
    }
    const photo = await Photo.findOne({ _id: photoId, userId });
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found or not owned by user' });
    }
    photo.isEvaluatable = true;
    await photo.save();
    res.json({ message: 'Photo added to evaluatable list', photo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add photo to evaluatable list: ' + error.message });
  }
};

exports.removeFromEvaluatable = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { photoId } = req.body;
    const photo = await Photo.findOne({ _id: photoId, userId });
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found or not owned by user' });
    }
    photo.isEvaluatable = false;
    await photo.save();
    res.json({ message: 'Photo removed from evaluatable list', photo });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove photo from evaluatable list: ' + error.message });
  }
};
