const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware'); // your multer setup
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');
const videoController = require('../controllers/videoController');

// Upload video
router.post('/upload', authMiddleware, upload.single('video'), videoController.uploadVideo);

// User: Get videos sent to them or public ones
router.get('/', authMiddleware, videoController.getUserVideos);

// User: Get their own uploaded videos
router.get('/my', authMiddleware, videoController.getMyVideos);

// Admin: View all uploaded videos
router.get('/all', authMiddleware, requireAdmin, videoController.getAllVideos);

// Admin: Delete video
router.delete('/:id', authMiddleware, requireAdmin, videoController.deleteVideo);

// Download video by ID
router.get('/download/:id', authMiddleware, videoController.downloadVideo);

module.exports = router;