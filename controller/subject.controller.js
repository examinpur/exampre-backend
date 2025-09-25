const Subject = require("../model/subject");

// Create new subject
exports.createSubject = async (req, res) => {
  try {
    const { subject , classId } = req.body;

    if (!subject) {
      return res.status(400).json({ message: "Subject name is required." });
    }

    // Check for duplicate (case-insensitive)
 const existing = await Subject.findOne({
  subject: { $regex: new RegExp(`^${subject}$`, "i") },
  classId: classId // or whatever the variable name for class is
});


    if (existing) {
      return res.status(409).json({ message: "Subject with the same name already exists." });
    }

    const newSubject = await Subject.create({ subject , classId });
    return res.status(201).json({ message: "Subject created successfully.", data: newSubject });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// Get all subjects
exports.getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate("classId","class").sort({ createdAt: -1 });
    return res.status(200).json({ data: subjects });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch subjects.", error: error.message });
  }
};
exports.getAllSubjectsByClassId = async (req, res) => {
  try {
    const { classId } = req.params;
    const subjects = await Subject.find({ classId }).populate("classId","class").sort({ createdAt: -1 });
    return res.status(200).json({ data: subjects });
  } catch (error) {
      return res.status(500).json({ message: "Failed to fetch subjects.", error: error.message });
  }
}
exports.getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const subject = await Subject.findById(id).populate("classId","class");
    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    return res.status(200).json({ data: subject });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching subject.", error: error.message });
  }
};

// Update subject
exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject } = req.body;

    if (!subject) {
      return res.status(400).json({ message: "Subject name is required." });
    }

    // Check for duplicate name excluding current ID
    const existing = await Subject.findOne({
      _id: { $ne: id },
      subject: { $regex: new RegExp(`^${subject}$`, "i") },
    });

    if (existing) {
      return res.status(409).json({ message: "Another subject with the same name already exists." });
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      { subject },
      { new: true, runValidators: true }
    );

    if (!updatedSubject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    return res.status(200).json({ message: "Subject updated successfully.", data: updatedSubject });
  } catch (error) {
    return res.status(500).json({ message: "Error updating subject.", error: error.message });
  }
};

// Delete subject
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSubject = await Subject.findByIdAndDelete(id);
    if (!deletedSubject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    return res.status(200).json({ message: "Subject deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting subject.", error: error.message });
  }
};
