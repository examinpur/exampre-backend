const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
    unique: true // One solution per question
  },
  steps: [
    {
      type: String, // Each step is a LaTeX string
      required: true
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
}, { timestamps: true });

const solutionModel = mongoose.model('Solution', solutionSchema);

module.exports = { solutionModel };
