const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authMiddleware = require('./middleware/auth');
const uploadMiddleware = require('./middleware/upload');
const authController = require('./api/controllers/authController');
const photoController = require('./api/controllers/photoController');
const ratingController = require('./api/controllers/ratingController');

const router = express.Router();

// Middleware
router.use(bodyParser.json());
router.use(cors());

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);

// Photo Routes
router.post('/photos/upload', authMiddleware, uploadMiddleware.single('file'), photoController.uploadPhoto);
router.get('/photos/evaluate', authMiddleware, photoController.getPhotosForEvaluation);
router.post('/photos/add-to-evaluatable', authMiddleware, photoController.addToEvaluatable);
router.post('/photos/remove-from-evaluatable', authMiddleware, photoController.removeFromEvaluatable);

// Rating Routes
router.post('/ratings/rate', authMiddleware, ratingController.ratePhoto);
router.get('/ratings/statistics', authMiddleware, ratingController.getStatistics);

module.exports = router;
