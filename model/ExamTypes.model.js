const mongoose = require("mongoose");

const examTypesSchema = new mongoose.Schema(
  {
    examTypes: {
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

const examTypes = mongoose.model("examTypeses", examTypesSchema);

module.exports = examTypes;
