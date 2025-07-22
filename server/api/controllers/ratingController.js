const Rating = require('../../models/Rating');
const Photo = require('../../models/Photo');
const User = require('../../models/User');

exports.ratePhoto = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { photoId, score } = req.body;
    const photo = await Photo.findById(photoId).populate('userId');
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    if (photo.userId._id.toString() === userId.toString()) {
      return res.status(400).json({ error: 'Cannot rate your own photo' });
    }
    const existingRating = await Rating.findOne({ photoId, userId });
    if (existingRating) {
      return res.status(400).json({ error: 'You have already rated this photo' });
    }
    const rating = new Rating({ photoId, userId, score });
    await rating.save();
    // Update points: rater gains 1 point, photo owner loses 1 point
    await User.findByIdAndUpdate(userId, { $inc: { points: 1 } });
    await User.findByIdAndUpdate(photo.userId._id, { $inc: { points: -1 } });
    res.status(201).json({ rating });
  } catch (error) {
    res.status(500).json({ error: 'Photo rating failed: ' + error.message });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const userId = req.user.userId;
    const photos = await Photo.find({ userId });
    const photoIds = photos.map(p => p._id);
    const ratings = await Rating.find({ photoId: { $in: photoIds } }).populate('photoId');
    const stats = {
      totalPhotos: photos.length,
      totalRatingsReceived: ratings.length,
      averageScore: ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(2) : 0,
      byGender: {},
      byAge: {}
    };
    ratings.forEach(rating => {
      const photo = rating.photoId;
      if (photo) {
        stats.byGender[photo.genderFilter] = (stats.byGender[photo.genderFilter] || 0) + 1;
        stats.byAge[photo.ageFilter] = (stats.byAge[photo.ageFilter] || 0) + 1;
      }
    });
    res.json({ statistics: stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics: ' + error.message });
  }
};
