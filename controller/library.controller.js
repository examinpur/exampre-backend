const { default: mongoose } = require("mongoose");
const { fileModel } = require("../model/myLibraryFiles");
const { folderModel } = require("../model/myLibraryFolder");
const { myLibraryQuestionsModel } = require("../model/myLibraryQuestions");
const { sectionModel } = require("../model/myLibrarySections");
const { questionModel } = require("../model/Questions");
const { globalFileModel } = require("../model/globalLibraryFiles");

exports.createFolder = async (req, res) => {
  try {
    const { name, date, parentId } = req.body;

    if (!name || !date) {
      return res.status(400).json({ message: "Name or date is missing." });
    }
    const existingFolder = await folderModel.findOne({
      name,
      parentId: parentId || null,
      type: "folder"
    });

    if (existingFolder) {
      return res.status(400).json({ message: `Folder with name ${name} already exists` });
    }

    const folder = new folderModel({
      name,
      date,
      parentId: parentId || null,
      type: "folder",
      level: parentId ? 1 : 0, 
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await folder.save();

    res.status(201).json({
      message: "Folder created successfully",
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({
      message: "An error occurred while creating the folder",
      error: error.message
    });
  }
};

exports.editFolder = async (req, res) => {
  try {
    const { parentId, folderId } = req.params;
    const updateData = req.body;
    const folder = await folderModel.findOne({ _id: folderId, parentId: parentId || null });
    if (!folder) {
      return res.status(404).json({ message: "Folder not found with the given parentId." });
    }
    Object.assign(folder, updateData, { updatedAt: new Date() });
    await folder.save();

    res.status(200).json({ message: "Folder updated successfully", folder });
  } catch (error) {
    console.error("Error editing folder:", error);
    res.status(500).json({ message: "Error editing folder", error: error.message });
  }
};

exports.deleteFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const folder = await folderModel.findOne({ _id: folderId });
    if (!folder) {
      return res.status(404).json({ message: "Folder not found with the given parentId." });
    }
    await folderModel.findByIdAndDelete(folderId);
    
    res.status(200).json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ message: "Error deleting folder", error: error.message });
  }
};

exports.createFile = async (req, res) => {
  try {
    const { name, date, parentId, duration, tag, sections } = req.body;
    if (!name || !date  || !duration) {
      return res.status(400).json({ message: "Name or duration is missing." });
    }
    if (parentId) {
      const fileParents = await fileModel.find({ parentId, type : "file" });
      for (let fileParent of fileParents) {
        if (fileParent.name === name) {
          return res.status(400).json({ message: `File with name "${name}" already exists` });
        }
      }
    }
    const file = new fileModel({
      name,
      date,
      parentId: parentId || null,
      type : "file",
      duration,
      tag: tag || [],
      sections: sections || [], 
      level: parentId ? 1 : 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await file.save();
    res.status(201).json({
      message: "File created successfully",
      testId : file._id
    });
  } catch (error) {
    console.error("Error creating file:", error);
    res.status(500).json({
      message: "An error occurred while creating the file",
      error: error.message
    });
  }
};

exports.editFile = async (req, res) => {
  try {
    const { parentId, fileId } = req.params;
    const updateData = req.body;
    const file = await fileModel.findOne({ _id: fileId, parentId: parentId || null });
    if (!file) {
      return res.status(404).json({ message: "File not found with the given parentId." });
    }
    Object.assign(file, updateData, { updatedAt: new Date() });
    await file.save();

    res.status(200).json({ message: "File updated successfully", file });
  } catch (error) {
    console.error("Error editing file:", error);
    res.status(500).json({ message: "Error editing file", error: error.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { parentId, fileId } = req.params;

    const file = await fileModel.findOne({ _id: fileId, parentId: parentId || null });
    if (!file) {
      return res.status(404).json({ message: "File not found with the given parentId." });
    }
    await fileModel.findByIdAndDelete(fileId);
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ message: "Error deleting file", error: error.message });
  }
};

exports.createSection = async (req, res) => {
  try {
    const { name, instructions, maxSectionMarks, parentId } = req.body;

    if (!name || !parentId) {
      return res.status(400).json({ message: "Name and Parent id are required." });
    }

    const existSection = await sectionModel.findOne({parentId,name});

    if(existSection){
       return res.status(400).json({ message: `${name} section already exist` });
    }

    const section = new sectionModel({
      name,
      parentId,
      instructions: instructions || '',
      maxSectionMarks : maxSectionMarks || 0,
      questions: [],
    });

    await section.save();

    return res.status(201).json({
      message: "Section created successfully",
      section,
    });

  } catch (error) {
    console.error("Error creating section:", error);
    return res.status(500).json({
      message: "An error occurred while creating the section",
      error: error.message
    });
}
}

exports.editSection = async (req, res) => {
  try {
    const { sectionId, parentId } = req.params;
    const updatedData = req.body;

    const section = await sectionModel.findOne({ _id: sectionId, parentId });
    if (!section) {
      return res.status(404).json({ message: "Section not found for the given parentId." });
    }

    const updatedSection = await sectionModel.findByIdAndUpdate(
      sectionId,
      { ...updatedData, updatedAt: new Date() },
      { new: true }
    );

    return res.status(200).json({
      message: "Section updated successfully.",
      section: updatedSection,
    });
  } catch (error) {
    console.error("Error editing section:", error);
    return res.status(500).json({
      message: "An error occurred while editing the section.",
      error: error.message,
    });
  }
};

exports.deleteSection = async (req, res) => {
  try {
    const { sectionId } = req.params;

    const section = await sectionModel.findOne({ _id: sectionId});
    if (!section) {
      return res.status(404).json({ message: "Section not found for the given parentId." });
    }
    await myLibraryQuestionsModel.deleteMany({ _id: { $in: section.questions } });
    await sectionModel.findByIdAndDelete(sectionId);
    return res.status(200).json({
      message: "Section and its associated questions deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    return res.status(500).json({
      message: "An error occurred while deleting the section.",
      error: error.message,
    });
  }
};

exports.createQuestions = async (req, res) => {
  try {
    const { questions, sectionId } = req.body;
    const createdBy = req.user?._id;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Questions must be a non-empty array." });
    }

    if (!createdBy) {
      return res.status(401).json({ message: "Unauthorized: createdBy is missing from user session." });
    }

    const lastQuestion = await questionModel.findOne().sort({ number: -1 }).lean();
    let nextNumber = lastQuestion?.number ? lastQuestion.number + 1 : 1;

    const preparedQuestions = [];
    console.log(questions);

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      const {
        type,
        questionText,
        marks,
        difficultyLevel,
        options,
        answerType,
        correctAnswer,
        blanks,
        passage,
        subQuestions,
        chapterName,
        topic,
        titles,
        subject,
        category,
        year,
        previousYearsQuestion,
        resource,
        negativeMarking = false,
        negativeMarksValue = 0
      } = question;

      if (!type || !questionText || marks == null || !difficultyLevel) {
        return res.status(400).json({
          message: `Question ${i + 1}: Missing required fields (type, questionText, marks, difficultyLevel).`,
        });
      }

      // Type-specific validation
      switch (type) {
        case "mcq":
          if (!Array.isArray(options) || options.length !== 4) {
            return res.status(400).json({ message: `Question ${i + 1}: MCQ must have exactly 4 options.` });
          }
          if (!options.some(opt => opt.isCorrect === true)) {
            return res.status(400).json({ message: `Question ${i + 1}: At least one correct option is required.` });
          }
          break;

       case "truefalse":
        if (!Array.isArray(options) || options.length !== 2) {
        return res.status(400).json({ message: `Question ${i + 1}: True/False must have exactly 2 options (True and False).` });
        }
  const validTF = options.some(opt => opt.text === 'True') && options.some(opt => opt.text === 'False');
  if (!validTF) {
    return res.status(400).json({ message: `Question ${i + 1}: Options must contain 'True' and 'False'.` });
  }

  const trueOption = options.find(opt => opt.text === 'True');
  if (typeof trueOption?.isCorrect !== 'boolean') {
    return res.status(400).json({ message: `Question ${i + 1}: True option must include isCorrect boolean.` });
  }
  question.correctAnswer = trueOption.isCorrect;
  break;

        case "fillintheblank":
          if (!Array.isArray(blanks) || blanks.length === 0) {
            return res.status(400).json({ message: `Question ${i + 1}: Fill-in-the-blank must have at least one blank.` });
          }
          for (const blank of blanks) {
            if (!blank.correctAnswer) {
              return res.status(400).json({ message: `Question ${i + 1}: Each blank must have correctAnswer.` });
            }
          }
          break;

        case "integerType":
          if (correctAnswer == null || typeof correctAnswer !== "number") {
            return res.status(400).json({ message: `Question ${i + 1}: Integer type must have a numeric correctAnswer.` });
          }
          break;

        case "comprehension":
          if (!passage) {
            return res.status(400).json({ message: `Question ${i + 1}: Comprehension must have a passage.` });
          }
          if (!Array.isArray(subQuestions) || subQuestions.length === 0) {
            return res.status(400).json({ message: `Question ${i + 1}: Comprehension must have sub-questions.` });
          }

          for (let j = 0; j < subQuestions.length; j++) {
            const subQ = subQuestions[j];
            if (!subQ.type || !subQ.questionText) {
              return res.status(400).json({ message: `Question ${i + 1}, Sub-question ${j + 1}: Missing required fields.` });
            }

            if (subQ.type === "mcq" && (!Array.isArray(subQ.options) || subQ.options.length !== 4)) {
              return res.status(400).json({ message: `Question ${i + 1}, Sub-question ${j + 1}: MCQ must have 4 options.` });
            }

            if (subQ.type === "fillintheblank" && (!Array.isArray(subQ.blanks) || subQ.blanks.length === 0)) {
              return res.status(400).json({ message: `Question ${i + 1}, Sub-question ${j + 1}: must have blanks.` });
            }
          }

          break;

        default:
          return res.status(400).json({ message: `Question ${i + 1}: Invalid type '${type}'.` });
      }

      // Prepare question object
      const newQuestion = {
        ...question,
        sectionId: [new mongoose.Types.ObjectId(sectionId)] || [],
        createdBy,
        chapterName,
        topic,
        category,
        subject,
        titles: titles || [],
        year: year || '',
        previousYearsQuestion: previousYearsQuestion || false,
        resource: resource || '',
        negativeMarking,
        negativeMarksValue,
        number: nextNumber++,
      };

      preparedQuestions.push(newQuestion);
    }
    const inserted = await questionModel.insertMany(preparedQuestions);
    res.status(201).json({
      message: `${inserted.length} question(s) created successfully.`,
      questions: inserted,
    });
  } catch (error) {
    console.error("Error creating questions:", error);
    res.status(500).json({
      message: "An error occurred while creating the questions.",
      error: error.message,
    });
  }
};


exports.editQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const updateData = req.body;
    const userId = req.user?._id;
    if (!questionId || !mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: "Invalid or missing questionId." });
      }
      const existingQuestion = await questionModel.findOne({_id :questionId});
      if (!existingQuestion) {

        return res.status(404).json({ message: "Question not found." });
      }

      if (
  !existingQuestion.createdBy ||
  existingQuestion.createdBy.toString() !== userId?.toString()
) {
  return res.status(403).json({ message: "You are not authorized to update this question." });
}
      for (const key in updateData) {
        if (updateData.hasOwnProperty(key)) {
          existingQuestion[key] = updateData[key];
        }
      }
      const updatedQuestion = await existingQuestion.save();
      return res.status(200).json({
        message: "Question updated successfully.",
        question: updatedQuestion,
      });

    } catch (error) {
      console.error("Error updating question:", error);
      return res.status(500).json({
        message: "An error occurred while updating the question.",
        error: error.message,
      });
    }
  };


exports.deleteQuestion = async (req, res) => {
  try {
    const { questionId, sectionId } = req.params;

    const question = await questionModel.findOne({
      _id: questionId,
    });

    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }
    const sectionObjectId = new mongoose.Types.ObjectId(sectionId);

    const updatedQuestion = await questionModel.findOneAndUpdate(
      { _id: questionId },
      { $pull: { sectionId: sectionObjectId } },
      { new: true }
    );

    console.log("Updated Question:", updatedQuestion);

    return res.status(200).json({
      message: "Section removed from question successfully.",
      question: updatedQuestion,
    });
  } catch (error) {
    console.error("Error removing section from question:", error);
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};



exports.getRootOrChildItems = async (req, res) => {
  try {
    const { parentId } = req.query;

    let filter = {};
    let children = [];
    let responseData = null;

    if (!parentId) {
      filter = { level: 0 };
      const [files, folders] = await Promise.all([
        fileModel.find(filter).lean(),
        folderModel.find(filter).lean(),
      ]);
      children = [...files, ...folders];
      responseData = {
        _id: "my-library",
        name: "My Library",
        type: "folder",
        parentId: null,
        level: 0,
        date: new Date().toLocaleDateString("en-GB"),
        children,
      };

      return res.status(200).json({ data: responseData });
    } else {
      const parentFolder = await folderModel.findById(parentId).lean();
      if (!parentFolder) {
        return res.status(404).json({ message: "Parent folder not found" });
      }

      filter = { parentId: parentId, level: { $ne: 0 } };
      const [files, folders] = await Promise.all([
        fileModel.find(filter).lean(),
        folderModel.find(filter).lean(),
      ]);
      children = [...files, ...folders];

      parentFolder.children = children;
      return res.status(200).json({ data: parentFolder });
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ message: "Failed to fetch data", error: error.message });
  }
};

exports.getSectionsWithQuestionsByParentId = async (req, res) => {
  try {
    const { sectionId } = req.params;
    if (!sectionId) {
      return res.status(400).json({ message: "sectionId query parameter is required." });
    }

    const sectionObjectId = new mongoose.Types.ObjectId(sectionId);

    const sections = await sectionModel.findById(sectionId);
    if (!sections) {
      return res.status(404).json({ message: "Section not found." });
    }

    const questions = await questionModel.find({ sectionId: sectionObjectId });

    sections._doc.questions = questions;
    res.status(200).json({ sections });
  } catch (error) {
    console.error("Error fetching sections with questions:", error);
    res.status(500).json({ message: "Failed to fetch sections with questions", error: error.message });
  }
};

exports.getSectionsWithQuestionsByFileId = async (req, res) => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      return res.status(400).json({ message: "fileId parameter is required." });
    }

    const test = await fileModel.findById(fileId).select("name date duration preview");
    const sections = await sectionModel.find({ parentId: fileId }).select("name instructions maxSectionMarks").lean();

    if (sections.length === 0) {
      return res.status(404).json({ message: "No sections found for this file ID." });
    }

    const sectionIds = sections.map(sec => sec._id);
   const allQuestions = await questionModel.find({ 
  sectionId: { $elemMatch: { $in: sectionIds } } 
})
.select("sectionId type options negativeMarksValue difficultyLevel questionText marks previousYearsQuestion resource answerType subQuestions")
.lean();

const questionMap = {};
allQuestions.forEach(q => {
  if (Array.isArray(q.sectionId)) {
    q.sectionId.forEach(sid => {
      const sidString = sid.toString();
      if (!questionMap[sidString]) {
        questionMap[sidString] = [];
      }
      questionMap[sidString].push(q);
    });
  }
});


    const enrichedSections = sections.map(section => ({
      ...section,
      questions: questionMap[section._id.toString()] || []
    }));

    res.status(200).json({ test, data: enrichedSections });

  } catch (error) {
    console.error("Error fetching sections with questions:", error);
    res.status(500).json({ message: "Failed to fetch sections with questions", error: error.message });
  }
};

exports.getSectionsByFileId = async (req,res) =>{
    const {fileId} = req.params;
  try {
    const sections = await sectionModel.find({parentId : fileId});
    const test = await fileModel.findById(fileId);
    res.status(200).json({test,sections})
  } catch (error) {
    console.error("Error fetching sections with questions:", error);
    res.status(500).json({ message: "Failed to fetch sections with questions", error: error.message });
  }
}

exports.updatePreviewType = async(req,res) =>{
  try {
    const {testId} = req.params;
    const {preview} = req.body;
    const test = await fileModel.findById(testId);
    test.preview = preview;
    await test.save();
    res.status(200).json({message : "update the value of preview"})
  } catch (error) {
    console.error("Error fetching sections with questions:", error);
    res.status(500).json({ message: "Failed to fetch sections with questions", error: error.message });
  }
}

exports.importQuestionsInSection = async (req, res) => {
  const { sectionId } = req.params;
  const { questionIds } = req.body;
  
  if (
    !Array.isArray(questionIds) ||
    questionIds.length === 0 || // Changed from < 0 to === 0
    !mongoose.Types.ObjectId.isValid(sectionId)
  ) {
    return res.status(400).json({
      message: 'Invalid input. At least one valid question ID and a valid sectionId are required.'
    });
  }

  try {
    const sectionObjectId = new mongoose.Types.ObjectId(sectionId);
    
    // Update each question with section ID and increment import count
    const updatePromises = questionIds.map(async (id) => {
      return await questionModel.updateOne(
        { _id: id },
        {
          $addToSet: { sectionId: sectionObjectId },
          $inc: { 'numberOfQuestionImport.count': 1 }, // Increment import count
          $set: { 
            'numberOfQuestionImport.test': sectionObjectId // Store the section/test ID
          }
        }
      );
    });

    const results = await Promise.all(updatePromises);
    
    // Count successful updates
    const successfulUpdates = results.filter(result => result.modifiedCount > 0).length;
    
    res.status(200).json({ 
      message: "Questions imported successfully.",
      importedCount: successfulUpdates,
      totalRequested: questionIds.length
    });
    
  } catch (error) {
    console.error("Error importing questions:", error);
    res.status(500).json({
      message: "Failed to import questions",
      error: error.message
    });
  }
};


exports.getAllTests = async (req,res) => {
  try {
    const testLib = await fileModel.find().select("name date parentId").populate("parentId","name");
    const testGlo = await globalFileModel.find().select("name date parentId").populate("parentId","name");
    const data = [...testLib , ...testGlo];
    res.status(200).json({ message: "Questions fetched successfully.", data });
  } catch (error) {
    console.error("Error gettings questions:", error);
    res.status(500).json({
      message: "Failed to getting questions",
      error: error.message
    });
  }
}

exports.getGlobalTests = async (req,res) => {
  try {
    const testGlo = await globalFileModel.find().select("name date parentId").populate("parentId","name");
    res.status(200).json({ message: "Questions fetched successfully.", testGlo });
  } catch (error) {
    console.error("Error gettings questions:", error);
    res.status(500).json({
      message: "Failed to getting questions",
      error: error.message
    });
  }
}

exports.importQuestionsInSection = async (req, res) => {
  const { sectionId } = req.params;
  const { questionIds } = req.body;
  
  if (
    !Array.isArray(questionIds) ||
    questionIds.length === 0 || // Changed from < 0 to === 0
    !mongoose.Types.ObjectId.isValid(sectionId)
  ) {
    return res.status(400).json({
      message: 'Invalid input. At least one valid question ID and a valid sectionId are required.'
    });
  }

  try {
    const sectionObjectId = new mongoose.Types.ObjectId(sectionId);
    
    // Update each question with section ID and increment import count
    const updatePromises = questionIds.map(async (id) => {
      return await questionModel.updateOne(
        { _id: id },
        {
          $addToSet: { sectionId: sectionObjectId },
          $inc: { 'numberOfQuestionImport.count': 1 }, // Increment import count
          $set: { 
            'numberOfQuestionImport.test': sectionObjectId // Store the section/test ID
          }
        }
      );
    });

    const results = await Promise.all(updatePromises);
    
    // Count successful updates
    const successfulUpdates = results.filter(result => result.modifiedCount > 0).length;
    
    res.status(200).json({ 
      message: "Questions imported successfully.",
      importedCount: successfulUpdates,
      totalRequested: questionIds.length
    });
    
  } catch (error) {
    console.error("Error importing questions:", error);
    res.status(500).json({
      message: "Failed to import questions",
      error: error.message
    });
  }
};

// Alternative version if you want to track multiple test imports
exports.importQuestionsInSectionAdvanced = async (req, res) => {
  const { sectionId } = req.params;
  const { questionIds } = req.body;
  
  if (
    !Array.isArray(questionIds) ||
    questionIds.length === 0 ||
    !mongoose.Types.ObjectId.isValid(sectionId)
  ) {
    return res.status(400).json({
      message: 'Invalid input. At least one valid question ID and a valid sectionId are required.'
    });
  }

  try {
    const sectionObjectId = new mongoose.Types.ObjectId(sectionId);
    
    // Update each question with section ID and track import history
    const updatePromises = questionIds.map(async (id) => {
      return await questionModel.updateOne(
        { _id: id },
        {
          $addToSet: { 
            sectionId: sectionObjectId,
            'numberOfQuestionImport.test': sectionObjectId // Track multiple test imports
          },
          $inc: { 'numberOfQuestionImport.count': 1 }
        }
      );
    });

    const results = await Promise.all(updatePromises);
    
    // Count successful updates
    const successfulUpdates = results.filter(result => result.modifiedCount > 0).length;
    
    res.status(200).json({ 
      message: "Questions imported successfully.",
      importedCount: successfulUpdates,
      totalRequested: questionIds.length
    });
    
  } catch (error) {
    console.error("Error importing questions:", error);
    res.status(500).json({
      message: "Failed to import questions",
      error: error.message
    });
  }
};

exports.resetAllQuestionImportCounts = async (req, res) => {
  const userId = req.user?._id;
  
  if (!userId) {
    return res.status(401).json({
      message: 'Authentication required.'
    });
  }

  try {
    // Reset count to 0 and clear test array for all questions created by the user
    const result = await questionModel.updateMany(
      { createdBy: userId }, // Only reset questions created by this user
      {
        $set: {
          'numberOfQuestionImport.count': 0,
          'numberOfQuestionImport.test': []
        }
      }
    );

    res.status(200).json({
      message: "All your question import counts reset successfully.",
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("Error resetting all question import counts:", error);
    res.status(500).json({
      message: "Failed to reset all question import counts",
      error: error.message
    });
  }
};
