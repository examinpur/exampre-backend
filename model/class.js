const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    class: {
      type: String,
      required: true,
      trim: true,
       unique: true
    },
  },
  {
    timestamps: true,
  }
);

const Class = mongoose.model("classes", classSchema);

module.exports = Class;
