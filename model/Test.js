const mongoose = require("mongoose");

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    subject: {
      type: String,
      enum: ['physics', 'chemistry', 'mathematics', 'biology'],
      required: true,
    },
    chapterName: String,
    subtopic: String,
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
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
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

const testModel = mongoose.model('Test', testSchema);

module.exports = {testModel}