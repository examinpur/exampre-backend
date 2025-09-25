
const mongoose = require("mongoose");

const PracticeTestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    subject: {
      type: String,
      enum: ['physics', 'chemistry', 'mathematics', 'biology'],
      required: true,
    },
    chapterName: String,
    topic: String,
    level: {
      type: String,
      enum: ['easy', 'medium', 'difficult'],
      default: 'easy',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
    test: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GlobalLibraryFiles',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
  },
  { timestamps: true }
);

const PracticeTestModel = mongoose.model('QuestionBank', PracticeTestSchema);

module.exports = { PracticeTestModel };
