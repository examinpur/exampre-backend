const mongoose = require("mongoose");

const examSubCategorySchema = new mongoose.Schema(
  {
    subCategory: {
      type: String,
      required: true,
      trim: true,
       unique: true
    },
    examTypesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "examTypeses",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const examSubCategoriesModel = mongoose.model("examSubCategories", examSubCategorySchema);

module.exports = examSubCategoriesModel;
