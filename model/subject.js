const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    classId : {
      type : mongoose.Schema.Types.ObjectId,
      ref : "classes"
  },
  },
  
  {
    timestamps: true,
  }
);

const Subject = mongoose.model("Subject", subjectSchema);

module.exports = Subject;
