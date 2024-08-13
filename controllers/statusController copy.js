// controllers/statusController.js
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
    const statuses = await Status.find().populate('user', 'nom prenom').populate('comments.user', 'nom prenom');
    res.status(200).json(statuses);
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

    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
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

    if (!status) {
      return res.status(404).json({ message: 'Status not found' });
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
