// routes/statusRoutes.js
const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Routes pour les statuts
router.post('/', authMiddleware, upload.array('media', 5), statusController.createStatus);
router.get('/', statusController.getStatuses);
router.delete('/:id', authMiddleware, statusController.deleteStatus);

// Routes pour les commentaires
router.post('/:id/comment', authMiddleware, statusController.addComment);
router.delete('/:id/comment/:commentId', authMiddleware, statusController.deleteComment);

module.exports = router;
