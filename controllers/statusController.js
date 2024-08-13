const Status = require('../models/status');

exports.createStatus = async (req, res) => {
  try {
    const { content } = req.body;
    const media = req.files ? req.files.map(file => file.path) : [];

    if (!content && media.length === 0) {
      return res.status(400).json({ message: 'Content or media is required' });
    }

    const status = new Status({
      user: req.user._id,
      content,
      media
    });

    await status.save();
    res.status(201).json(status);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStatuses = async (req, res) => {
  try {
    const statuses = await Status.find()
      .populate('user', 'nom prenom')
      .populate('comments.user', 'nom prenom')
      .sort({ createdAt: -1 });

    const activeStatuses = statuses.filter(status => !status.hasExpired());
    res.status(200).json(activeStatuses);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statuts' });
  }
};

exports.getStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await Status.findById(id)
      .populate('user', 'nom prenom')
      .populate('comments.user', 'nom prenom');

    if (!status || status.hasExpired()) {
      return res.status(404).json({ message: 'Status not found or expired' });
    }

    // Enregistrer la vue si non encore vue
    if (!status.views.some(view => view.user.toString() === req.user._id.toString())) {
      status.views.push({ user: req.user._id });
      await status.save();
    }

    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await Status.findByIdAndDelete(id);

    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
    }

    res.status(200).json({ message: 'Status deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const status = await Status.findById(id);

    if (!status || status.hasExpired()) {
      return res.status(404).json({ message: 'Status not found or expired' });
    }

    // Vérification du type d'utilisateur
    if (req.user.role !== 'visiteur') {
      return res.status(403).json({ message: 'Seuls les visiteurs peuvent commenter' });
    }

    // Vérifier que l'utilisateur ne commente pas son propre statut
    if (status.user.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous ne pouvez pas commenter votre propre statut' });
    }

    status.comments.push({
      user: req.user._id,
      content
    });

    await status.save();
    res.status(201).json(status);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const status = await Status.findById(id);

    if (!status || status.hasExpired()) {
      return res.status(404).json({ message: 'Status not found or expired' });
    }

    const commentIndex = status.comments.findIndex(comment => comment._id.toString() === commentId);

    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    status.comments.splice(commentIndex, 1);
    await status.save();

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStatusViews = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await Status.findById(id).populate('views.user', 'nom prenom');

    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
    }

    res.status(200).json(status.views);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
