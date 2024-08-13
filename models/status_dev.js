const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  media: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Status', statusSchema);
