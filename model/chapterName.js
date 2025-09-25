const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    chapterName: {
      type: String,
      required: true,
      trim: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject", // reference to Subject model
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Chapter = mongoose.model("Chapter", chapterSchema);

module.exports = Chapter;
