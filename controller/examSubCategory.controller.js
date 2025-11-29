const examSubCategoriesModel = require("../model/examSubCategory.model");

exports.createSubCategory = async (req, res) => {
  try {
    const { subcategory , examTypesId } = req.body;
    if (!subcategory) {
      return res.status(400).json({ message: "Category is required." });
    }
    const existing = await examSubCategoriesModel.findOne({ subCategory: { $regex: new RegExp(`^${type}$`, 'i') } , examTypesId: examTypesId});

    if (existing) {
      return res.status(409).json({ message: "Category with the same name already exists." });
    }
    const newSubcat = await examSubCategoriesModel.create({ subCategory:subcategory , examTypesId: examTypesId});
    return res.status(201).json({ message: "examTypes created successfully.", data: newSubcat });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};
exports.getAllSubCategories = async (req, res) => {
  try {
    const subCategory = await examSubCategoriesModel.find().sort({ createdAt: -1 });
    return res.status(200).json({ data: subCategory });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch examTypes.", error: error.message });
  }
};

exports.getexamSubCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const foundSubCategory = await examSubCategoriesModel.findById(id);
    if (!foundSubCategory) {
      return res.status(404).json({ message: "examTypes not found." });
    }
    return res.status(200).json({ data: foundSubCategory });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching examTypes.", error: error.message });
  }
};
exports.updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { subCategory , examTypesId } = req.body;
    if (!subCategory) {
      return res.status(400).json({ message: "Category is required." });
    }
    const existing = await examSubCategoriesModel.findOne({
      _id: { $ne: id },
      subCategory: { $regex: new RegExp(`^${subCategory}$`, 'i') },
      examTypesId : examTypesId
    });

    if (existing) {
      return res.status(409).json({ message: "Another Category with the same name already exists." });
    }
    const updatedexamTypes = await examSubCategoriesModel.findByIdAndUpdate(
      id,
      { subCategory: subCategory , examTypesId: examTypesId},
      { new: true, runValidators: true }
    );
    if (!updatedexamTypes) {
      return res.status(404).json({ message: "Category not found." });
    }
    return res.status(200).json({ message: "Category updated successfully.", data: updatedexamTypes });
  } catch (error) {
    return res.status(500).json({ message: "Error updating examTypes.", error: error.message });
  }
};
exports.deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSubCategory = await examSubCategoriesModel.findByIdAndDelete(id);
    if (!deletedSubCategory) {
      return res.status(404).json({ message: "Category not found." });
    }

    return res.status(200).json({ message: "Category deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting Category.", error: error.message });
  }
};
