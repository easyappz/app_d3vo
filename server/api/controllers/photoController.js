const Photo = require('../../models/Photo');
const User = require('../../models/User');

const POINTS_REQUIRED_FOR_EVALUATION = 10;

exports.uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const { title, genderFilter, ageFilter } = req.body;
    const photo = new Photo({
      title: title || 'Untitled',
      filePath: req.file.path,
      owner: req.userData.userId,
      genderFilter: genderFilter || 'all',
      ageFilter: ageFilter || 'all',
      isEvaluatable: false
    });
    await photo.save();
    res.status(201).json({ photo });
  } catch (error) {
    res.status(500).json({ message: 'Photo upload failed', error: error.message });
  }
};

exports.getPhotosForEvaluation = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { gender, age } = req.query;
    const query = {
      isEvaluatable: true,
      owner: { $ne: userId }
    };
    if (gender && gender !== 'all') {
      query.genderFilter = { $in: [gender, 'all'] };
    }
    if (age && age !== 'all') {
      query.ageFilter = { $in: [age, 'all'] };
    }
    const photos = await Photo.find(query).populate('owner');
    res.status(200).json({ photos });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch photos', error: error.message });
  }
};

exports.addToEvaluatable = async (req, res) => {
  try {
    const { photoId } = req.body;
    const userId = req.userData.userId;
    const user = await User.findById(userId);
    if (user.points < POINTS_REQUIRED_FOR_EVALUATION) {
      return res.status(400).json({ message: 'Not enough points to add photo for evaluation' });
    }
    const photo = await Photo.findOne({ _id: photoId, owner: userId });
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found or not owned by user' });
    }
    photo.isEvaluatable = true;
    user.points -= POINTS_REQUIRED_FOR_EVALUATION;
    await photo.save();
    await user.save();
    res.status(200).json({ message: 'Photo added to evaluatable list', photo });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add photo to evaluatable list', error: error.message });
  }
};

exports.removeFromEvaluatable = async (req, res) => {
  try {
    const { photoId } = req.body;
    const userId = req.userData.userId;
    const photo = await Photo.findOne({ _id: photoId, owner: userId });
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found or not owned by user' });
    }
    photo.isEvaluatable = false;
    await photo.save();
    res.status(200).json({ message: 'Photo removed from evaluatable list', photo });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove photo from evaluatable list', error: error.message });
  }
};
