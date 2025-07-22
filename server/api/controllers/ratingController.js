const Rating = require('../../models/Rating');
const Photo = require('../../models/Photo');
const User = require('../../models/User');

exports.ratePhoto = async (req, res) => {
  try {
    const { photoId, score } = req.body;
    const userId = req.userData.userId;
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    if (photo.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot rate your own photo' });
    }
    const existingRating = await Rating.findOne({ photo: photoId, user: userId });
    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this photo' });
    }
    const rating = new Rating({
      photo: photoId,
      user: userId,
      score
    });
    await rating.save();
    const owner = await User.findById(photo.owner);
    owner.points += 1;
    await owner.save();
    res.status(201).json({ rating });
  } catch (error) {
    res.status(500).json({ message: 'Photo rating failed', error: error.message });
  }
};

exports.getStatistics = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const photos = await Photo.find({ owner: userId });
    const photoIds = photos.map(photo => photo._id);
    const ratings = await Rating.find({ photo: { $in: photoIds } }).populate('photo');
    const statistics = photos.map(photo => {
      const photoRatings = ratings.filter(rating => rating.photo._id.toString() === photo._id.toString());
      const averageScore = photoRatings.length > 0 
        ? photoRatings.reduce((sum, rating) => sum + rating.score, 0) / photoRatings.length 
        : 0;
      return {
        photoId: photo._id,
        title: photo.title,
        ratingsCount: photoRatings.length,
        averageScore
      };
    });
    res.status(200).json({ statistics });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch statistics', error: error.message });
  }
};
