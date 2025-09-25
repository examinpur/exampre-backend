const CourseModel = require("../model/course");

exports.createCourse = async (req, res) => {
  try {
    const { course } = req.body;

    if (!course) {
      return res.status(400).json({ message: "course is required." });
    }

    // Check for duplicate (case-insensitive)
    const existing = await CourseModel.findOne({
      course: { $regex: new RegExp(`^${course}$`, "i") },
    });

    if (existing) {
      return res.status(409).json({ message: "course with the same name already exists." });
    }

    const newcourse = await CourseModel.create({ course });
    return res.status(201).json({ message: "course created successfully.", data: newcourse });
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await CourseModel.find({ isDelete : false });
    return res.status(200).json({ data: courses });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch courses.", error: error.message });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await CourseModel.findById(id);
    if (!course) {
      return res.status(404).json({ message: "course not found." });
    }
  
    return res.status(200).json({ data: course });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching course.", error: error.message });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { course } = req.body;

    if (!course) {
      return res.status(400).json({ message: "course is required." });
    }

    // Check for duplicate name excluding current ID
    const existing = await CourseModel.findOne({
      _id: { $ne: id },
      course: { $regex: new RegExp(`^${course}$`, "i") },
    });

    if (existing) {
      return res.status(409).json({ message: "Another course with the same name already exists." });
    }

    const updatedcourse = await CourseModel.findByIdAndUpdate(
      id,
      { course },
      { new: true, runValidators: true }
    );

    if (!updatedcourse) {
      return res.status(404).json({ message: "course not found." });
    }

    return res.status(200).json({ message: "course updated successfully.", data: updatedcourse });
  } catch (error) {
    return res.status(500).json({ message: "Error updating course.", error: error.message });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedcourse = await CourseModel.findById(id);
    if (!deletedcourse) {
      return res.status(404).json({ message: "course not found." });
    }
    deletedcourse.isDelete = true;
    await deletedcourse.save();
    return res.status(200).json({ message: "course deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting course.", error: error.message });
  }
};
