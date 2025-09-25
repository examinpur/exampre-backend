const { globalFileModel } = require("../model/globalLibraryFiles");
const { GlobalSectionModel } = require("../model/globalLibrarySections");
const { PracticeTestModel } = require("../model/PracticeTest.model");
const { questionModel } = require("../model/Questions");
const { generatePracticeTestDocx } = require('../utils/docxGenerator');

exports.createPracticeTest = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      chapterName,
      topic,
      level,
      isPaid,
      price,
      test,
      teacherId // optional
    } = req.body;

    if (!title || !subject || !Array.isArray(test) || test.length === 0) {
      return res.status(400).json({ message: "Required fields are missing or invalid." });
    }

    const createdBy = teacherId ? { _id: teacherId, role: "teacher" } : "admin";

    const newQB = await PracticeTestModel.create({
      title,
      description,
      subject,
      chapterName,
      topic,
      level,
      isPaid,
      price,
      test,
      createdBy,
    });

    res.status(201).json({ message: "Question bank created successfully", data: newQB });
  } catch (err) {
    console.error("Create error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllPracticeTest = async (req, res) => {
  try {
    const data = await PracticeTestModel
      .find()
      .populate("test","name")
      .sort({ createdAt: -1 });

    res.status(200).json({message : "fetched successfully" , data});
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getPracticeTestById = async (req, res) => {
  try {
    const qbDoc = await PracticeTestModel.findById(req.params.id).populate("test");

    if (!qbDoc) {
      return res.status(404).json({ message: "Question bank not found" });
    }
    const qb = qbDoc.toObject(); 
    if (Array.isArray(qb.test)) {
      for (let test of qb.test) {
        const sectionCount = await GlobalSectionModel.countDocuments({ parentId: test._id });
        console.log(`Sections for test ${test._id}:`, sectionCount);
        test.sections = sectionCount;
      }
    }
    res.status(200).json(qb);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
exports.updatePracticeTest = async (req, res) => {
  try {
    const updates = req.body;

    const updated = await PracticeTestModel.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!updated) return res.status(404).json({ message: "Question bank not found" });

    res.status(200).json({ message: "Question bank updated", data: updated });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deletePracticeTest = async (req, res) => {
  try {
    const deleted = await PracticeTestModel.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Question bank not found" });

    res.status(200).json({ message: "Question bank deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllListOfTest = async (req, res) => {
  try {
    const tests = await globalFileModel.find().populate("parentId", "name");

    if (!tests || tests.length === 0) {
      return res.status(200).json({ message: "No tests available", tests: [] });
    }

    const filteredTests = tests.map(test => ({
      name: test.name,
      _id : test._id,
      parentId: test.parentId
        ? {
            _id: test.parentId._id,
            name: test.parentId.name,
          }
        : null,
    }));

    res.status(200).json({ message: "Tests fetched successfully", tests: filteredTests });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getAllListOfWithSections = async (req, res) => {
  try {
    const tests = await globalFileModel.find().populate("parentId", "name").lean();

    if (!tests || tests.length === 0) {
      return res.status(200).json({ message: "No tests available", tests: [] });
    }
    const testIds = tests.map(test => test._id);
    const allSections = await GlobalSectionModel.find(
      { parentId: { $in: testIds } },
      "_id name parentId"
    ).lean();
    const sectionsMap = new Map();
    for (const section of allSections) {
      const pid = section.parentId.toString();
      if (!sectionsMap.has(pid)) sectionsMap.set(pid, []);
      sectionsMap.get(pid).push({ _id: section._id, name: section.name });
    }
    const results = tests.map(test => ({
      _id: test._id,
      name: test.name,
      parentId: test.parentId
        ? {
            _id: test.parentId._id,
            name: test.parentId.name,
          }
        : null,
      sections: sectionsMap.get(test._id.toString()) || [],
    }));

    return res.status(200).json({
      message: "Tests fetched successfully",
      tests: results,
    });
  } catch (error) {
    console.error("Error fetching tests with sections:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper: fetch image as buffer
// async function fetchImageBuffer(url) {
//   try {
//     const response = await axios.get(url, { responseType: "arraybuffer" });
//     return Buffer.from(response.data, "binary");
//   } catch (e) {
//     return null;
//   }
// }

// Rename and simplify the controller function
exports.downloadPracticeTestDocx = async (req, res) => {
  try {
    await generatePracticeTestDocx(req, res);
  } catch (err) {
    console.error('Error generating DOCX:', err);
    res.status(500).send('Failed to generate DOCX');
  }
};
