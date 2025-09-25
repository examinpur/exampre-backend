const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema(
  {
    course: {
      type: String,
      required: true,
      trim: true,
    },
    isDelete : {type : Boolean , default : false},
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const CourseModel = mongoose.model("Course", CourseSchema);

module.exports = CourseModel;
