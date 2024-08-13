const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const User = require('../models/user'); // Ajoutez cette ligne pour vous assurer que User est importé

// Routes pour les posts
router.get('/', postController.getPosts);
router.post('/', authMiddleware, upload.array('media', 10), postController.createPost);
router.put('/', authMiddleware, postController.updatePost);
router.delete('/', authMiddleware, postController.deletePost);

// Routes pour les commentaires
router.post('/comment', authMiddleware, postController.addComment);
router.put('/comment', authMiddleware, postController.updateComment);
router.delete('/comment', authMiddleware, postController.deleteComment);

// Routes pour les likes
router.post('/like', authMiddleware, postController.likePost);
router.post('/unlike', authMiddleware, postController.unlikePost);
router.post('/likecomment', authMiddleware, postController.likeComment);
router.post('/unlikecomment', authMiddleware, postController.unlikeComment);

// Route pour le partage de posts
router.post('/share', authMiddleware, postController.sharePost);

// Route pour l'achat de crédits
router.post('/buy-credit', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        if (user.userType === 'tailleur') {
            const amount = req.body.amount; // Montant de crédits achetés
            user.credit += amount; // Correction : Ajout de crédits au lieu de les soustraire
            await user.save();
            return res.status(200).json({ message: `Vous avez acheté ${amount} crédits.` });
        } else {
            return res.status(403).json({ message: 'Action non autorisée pour ce type d\'utilisateur.' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erreur serveur.' });
    }
});

module.exports = router;
l