const examTypes = require("../model/ExamTypes.model");

exports.createExamTypes = async (req, res) => {
  try {
    const { type } = req.body;
    if (!type) {
      return res.status(400).json({ message: "examTypes name is required." });
    }
    const existing = await examTypes.findOne({ examTypes: { $regex: new RegExp(`^${type}$`, 'i') } });

    if (existing) {
      return res.status(409).json({ message: "examTypes with the same name already exists." });
    }
    const newexamTypes = await examTypes.create({ examTypes:type });
    return res.status(201).json({ message: "examTypes created successfully.", data: newexamTypes });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};
exports.getAllExamTypeses = async (req, res) => {
  try {
    const examTypeses = await examTypes.find().sort({ createdAt: -1 });
    return res.status(200).json({ data: examTypeses });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch examTypes.", error: error.message });
  }
};

exports.getExamTypesById = async (req, res) => {
  try {
    const { id } = req.params;
    const foundexamTypes = await examTypes.findById(id);
    if (!foundexamTypes) {
      return res.status(404).json({ message: "examTypes not found." });
    }
    return res.status(200).json({ data: foundexamTypes });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching examTypes.", error: error.message });
  }
};
exports.updateExamTypes = async (req, res) => {
  try {
    const { id } = req.params;
    const { examTypesName } = req.body;
    if (!examTypesName) {
      return res.status(400).json({ message: "examTypes name is required." });
    }
    const existing = await examTypes.findOne({
      _id: { $ne: id },
      examTypes: { $regex: new RegExp(`^${examTypesName}$`, 'i') },
    });

    if (existing) {
      return res.status(409).json({ message: "Another examTypes with the same name already exists." });
    }
    const updatedexamTypes = await examTypes.findByIdAndUpdate(
      id,
      { examTypes: examTypesName },
      { new: true, runValidators: true }
    );
    if (!updatedexamTypes) {
      return res.status(404).json({ message: "examTypes not found." });
    }
    return res.status(200).json({ message: "examTypes updated successfully.", data: updatedexamTypes });
  } catch (error) {
    return res.status(500).json({ message: "Error updating examTypes.", error: error.message });
  }
};
exports.deleteExamTypes = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedexamTypes = await examTypes.findByIdAndDelete(id);
    if (!deletedexamTypes) {
      return res.status(404).json({ message: "examTypes not found." });
    }

    return res.status(200).json({ message: "examTypes deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting examTypes.", error: error.message });
  }
};
