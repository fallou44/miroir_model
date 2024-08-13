const express = require('express');
const router = express.Router();
const statusController = require('../controllers/statusController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Routes pour les statuts
router.post('/', authMiddleware, upload.array('media', 10), statusController.createStatus);
router.get('/', authMiddleware, statusController.getStatuses); // Liste des statuts
router.get('/:id', authMiddleware, statusController.getStatus); // Lire un statut
router.delete('/:id', authMiddleware, statusController.deleteStatus); // Supprimer un statut

// Routes pour les commentaires
router.post('/:id/comment', authMiddleware, statusController.addComment);
router.delete('/:id/comment/:commentId', authMiddleware, statusController.deleteComment);

// Route pour compter les vues
router.get('/:id/views', authMiddleware, statusController.getStatusViews);

module.exports = router;
