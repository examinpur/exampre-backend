const Chapter = require("../model/chapterName");
const Subject = require("../model/subject");

exports.createChapter = async (req, res) => {
  try {
    const { chapterName, subjectId } = req.body;

    if (!chapterName || !subjectId) {
      return res.status(400).json({ message: "chapterName and subjectId are required." });
    }

    const subjectExists = await Subject.findById(subjectId);
    if (!subjectExists) {
      return res.status(404).json({ message: "Subject not found." });
    }

    const existing = await Chapter.findOne({
      chapterName: { $regex: new RegExp(`^${chapterName}$`, "i") },
      subjectId,
    });

    if (existing) {
      return res.status(409).json({ message: "Chapter already exists under this subject." });
    }

    const newChapter = await Chapter.create({ chapterName, subjectId });
    return res.status(201).json({ message: "Chapter created successfully.", data: newChapter });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

exports.getAllChapters = async (req, res) => {
  try {
const chapters = await Chapter.find()
  .populate({
    path: 'subjectId',
    populate: {
      path: 'classId',
      model: 'classes',
      select: 'class'
    }
  })
  .sort({ createdAt: -1 });    return res.status(200).json({ data: chapters });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching chapters.", error: error.message });
  }
};

exports.getChapterById = async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findById(id).populate("subjectId");
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found." });
    }
    return res.status(200).json({ data: chapter });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching chapter.", error: error.message });
  }
};

exports.getChaptersBySubjectId = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const chapters = await Chapter.find({ subjectId }).sort({ createdAt: -1 });
    return res.status(200).json({ data: chapters });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching chapters.", error: error.message });
  }
};

exports.updateChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const { chapterName, subjectId } = req.body;

    if (!chapterName || !subjectId) {
      return res.status(400).json({ message: "chapterName and subjectId are required." });
    }

    const subjectExists = await Subject.findById(subjectId);
    if (!subjectExists) {
      return res.status(404).json({ message: "Subject not found." });
    }

    const duplicate = await Chapter.findOne({
      _id: { $ne: id },
      chapterName: { $regex: new RegExp(`^${chapterName}$`, "i") },
      subjectId,
    });

    if (duplicate) {
      return res.status(409).json({ message: "Another chapter with this name exists under this subject." });
    }

    const updated = await Chapter.findByIdAndUpdate(
      id,
      { chapterName, subjectId },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Chapter not found." });
    }

    return res.status(200).json({ message: "Chapter updated successfully.", data: updated });
  } catch (error) {
    return res.status(500).json({ message: "Error updating chapter.", error: error.message });
  }
};

exports.deleteChapter = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Chapter.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Chapter not found." });
    }
    return res.status(200).json({ message: "Chapter deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting chapter.", error: error.message });
  }
};
