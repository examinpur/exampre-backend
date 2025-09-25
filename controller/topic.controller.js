const Chapter = require("../model/chapterName");
const Topic = require("../model/topic");

exports.createTopic = async (req, res) => {
  try {
    const { topic, chapterId , subjectId } = req.body;
    console.log(req.body)
    if (!topic || !chapterId || !subjectId) {
      return res.status(400).json({ message: "topic and chapterId are required." });
    }

    // Validate chapter exists
    const chapterExists = await Chapter.findById(chapterId);
    if (!chapterExists) {
      return res.status(404).json({ message: "Chapter not found." });
    }

    // Prevent duplicate topicName in same chapter
    const existing = await Topic.findOne({
      topic: { $regex: new RegExp(`^${topic}$`, "i") },
      chapterId,
    });

    if (existing) {
      return res.status(409).json({ message: "Topic already exists under this chapter." });
    }

    const newTopic = await Topic.create({ topic, chapterId ,subjectId});
    return res.status(201).json({ message: "Topic created successfully.", data: newTopic });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error.", error: error.message });
  }
};

// Get all topics
exports.getAllTopics = async (req, res) => {
  try {
    const topics = await Topic.find().populate("chapterId") .populate({
    path: 'subjectId',
    populate: {
      path: 'classId',
      model: 'classes',
      select: 'class'
    }
  }).sort({ createdAt: -1 });
    return res.status(200).json({ data: topics });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching topics.", error: error.message });
  }
};

// Get topic by ID
exports.getTopicById = async (req, res) => {
  try {
    const { id } = req.params;

    const topic = await Topic.findById(id).populate("chapterId").populate("subjectId");
    if (!topic) {
      return res.status(404).json({ message: "Topic not found." });
    }

    return res.status(200).json({ data: topic });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching topic.", error: error.message });
  }
};

// Get topics by chapter ID
exports.getTopicsByChapterId = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const topics = await Topic.find({ chapterId }).populate("chapterId").populate("subjectId").sort({ createdAt: -1 });
    return res.status(200).json({ data: topics });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching topics.", error: error.message });
  }
};

// Update topic
exports.updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { topic, chapterId , subjectId } = req.body;

    if (!topic || !chapterId || subjectId) {
      return res.status(400).json({ message: "topicName and chapterId are required." });
    }

    const chapterExists = await Chapter.findById(chapterId);
    if (!chapterExists) {
      return res.status(404).json({ message: "Chapter not found." });
    }

    // Check for duplicate name in same chapter
    const duplicate = await Topic.findOne({
      _id: { $ne: id },
      topic: { $regex: new RegExp(`^${topicName}$`, "i") },
      chapterId,
    });

    if (duplicate) {
      return res.status(409).json({ message: "Another topic with the same name exists under this chapter." });
    }

    const updated = await Topic.findByIdAndUpdate(
      id,
      { topic, chapterId , subjectId },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Topic not found." });
    }

    return res.status(200).json({ message: "Topic updated successfully.", data: updated });
  } catch (error) {
    return res.status(500).json({ message: "Error updating topic.", error: error.message });
  }
};

// Delete topic
exports.deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Topic.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Topic not found." });
    }

    return res.status(200).json({ message: "Topic deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting topic.", error: error.message });
  }
};
