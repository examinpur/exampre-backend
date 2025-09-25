const Class = require("../model/class");

// Create a new class
exports.createClass = async (req, res) => {
  try {
    const { className } = req.body;

    if (!className) {
      return res.status(400).json({ message: "Class name is required." });
    }

    // Check for duplicate class name (case-insensitive)
    const existing = await Class.findOne({ class: { $regex: new RegExp(`^${className}$`, 'i') } });

    if (existing) {
      return res.status(409).json({ message: "Class with the same name already exists." });
    }

    const newClass = await Class.create({ class:className });
    return res.status(201).json({ message: "Class created successfully.", data: newClass });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// Get all classes
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find().sort({ createdAt: -1 });
    return res.status(200).json({ data: classes });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch classes.", error: error.message });
  }
};

// Get class by ID
exports.getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    const foundClass = await Class.findById(id);
    if (!foundClass) {
      return res.status(404).json({ message: "Class not found." });
    }

    return res.status(200).json({ data: foundClass });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching class.", error: error.message });
  }
};

// Update class
exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { className } = req.body;

    if (!className) {
      return res.status(400).json({ message: "Class name is required." });
    }

    // Check if another class with same name exists
    const existing = await Class.findOne({
      _id: { $ne: id },
      class: { $regex: new RegExp(`^${className}$`, 'i') },
    });

    if (existing) {
      return res.status(409).json({ message: "Another class with the same name already exists." });
    }

    const updatedClass = await Class.findByIdAndUpdate(
      id,
      { class: className },
      { new: true, runValidators: true }
    );

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found." });
    }

    return res.status(200).json({ message: "Class updated successfully.", data: updatedClass });
  } catch (error) {
    return res.status(500).json({ message: "Error updating class.", error: error.message });
  }
};

// Delete class
exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedClass = await Class.findByIdAndDelete(id);
    if (!deletedClass) {
      return res.status(404).json({ message: "Class not found." });
    }

    return res.status(200).json({ message: "Class deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting class.", error: error.message });
  }
};
