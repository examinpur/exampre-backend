const mongoose = require("mongoose");

const studentAttemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
    },
    questionBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuestionBank',
    },
    score: Number,
    attemptedOn: {
      type: Date,
      default: Date.now,
    },
    answers: [
      {
        question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        selectedAnswer: String,
        isCorrect: Boolean,
      },
    ],
  },
  { timestamps: true }
);

const studentAttemptModel = mongoose.model('StudentAttempt', studentAttemptSchema);

module.exports = {studentAttemptModel}