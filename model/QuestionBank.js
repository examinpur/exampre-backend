const mongoose = require("mongoose");

const questionBankSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    subject: {
      type : mongoose.Schema.Types.ObjectId,
      required: true,
      ref : "Subject"
    },
    chapterName: {
      type : mongoose.Schema.Types.ObjectId,
      required: true,
      ref : "Chapter"
    },
    topic: {
      type : mongoose.Schema.Types.ObjectId,
      required: true,
      ref : "Topic"
    },
    level: {
      type: String,
      enum: ['easy', 'medium', 'difficult'],
      default: 'easy',
    },
    parentId : {
      type: mongoose.Schema.Types.ObjectId,
      ref : "Bank"
    },
    levels : {
      type : Number,
      default : 0
        },
    createdBy: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

const questionBankModel = mongoose.model('Bank', questionBankSchema);

module.exports = { questionBankModel };
