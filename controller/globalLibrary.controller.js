const { default: mongoose } = require("mongoose");
const { globalFolderModel } = require("../model/globalLibraryFolder");
const { globalFileModel } = require("../model/globalLibraryFiles");
const { GlobalSectionModel } = require("../model/globalLibrarySections");
const { globalQuestionModel } = require("../model/globalLibraryQuestions");
const { questionModel } = require("../model/Questions");

exports.createFolder = async (req, res) => {
  try {
    const { name, date, parentId } = req.body;

    if (!name || !date) {
      return res.status(400).json({ message: "Name or date is missing." });
    }
    const existingFolder = await globalFolderModel.findOne({
      name,
      parentId: parentId || null,
      type: "folder"
    });

    if (existingFolder) {
      return res.status(400).json({ message: `Folder with name ${name} already exists` });
    }

    const folder = new globalFolderModel({
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
    const { folderId } = req.params;
    const updateData = req.body;
    const folder = await globalFolderModel.findOne({ _id: folderId });
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
    console.log(folderId);
    const folder = await globalFolderModel.findOne({ _id: folderId });
    if (!folder) {
      return res.status(404).json({ message: "Folder not found." });
    }
    await globalFolderModel.findByIdAndDelete(folderId);
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
      const fileParents = await globalFileModel.find({ parentId, type : "file" });
      for (let fileParent of fileParents) {
        if (fileParent.name === name) {
          return res.status(400).json({ message: `File with name "${name}" already exists` });
        }
      }
    }
    const file = new globalFileModel({
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
      message: "File created successfully",file
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
    const { fileId } = req.params;
    const updateData = req.body;
    const file = await globalFileModel.findOne({ _id: fileId });
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
    const { fileId } = req.params;

    const file = await globalFileModel.findOne({ _id: fileId });
    if (!file) {
      return res.status(404).json({ message: "File not found with the given parentId." });
    }
    await globalFileModel.findByIdAndDelete(fileId);
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

    const existSection = await GlobalSectionModel.findOne({parentId,name});

    if(existSection){
       return res.status(400).json({ message: `${name} section already exist` });
    }

    const section = new GlobalSectionModel({
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
    const { sectionId} = req.params;
    const updatedData = req.body;

    const section = await GlobalSectionModel.findOne({ _id: sectionId });
    if (!section) {
      return res.status(404).json({ message: "Section not found for the given parentId." });
    }

    const updatedSection = await GlobalSectionModel.findByIdAndUpdate(
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

    const section = await GlobalSectionModel.findOne({ _id: sectionId});
    if (!section) {
      return res.status(404).json({ message: "Section not found for the given parentId." });
    }
    await globalQuestionModel.deleteMany({ _id: { $in: section.questions } });
    await GlobalSectionModel.findByIdAndDelete(sectionId);
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
    const { questions, sectionIds } = req.body;
    if (!Array.isArray(sectionIds) || sectionIds.length === 0) {
      return res.status(400).json({ message: "Valid sectionIds array is required." });
    }
    for (const sectionId of sectionIds) {
      if (!mongoose.Types.ObjectId.isValid(sectionId)) {
        return res.status(400).json({ message: `Invalid sectionId format: ${sectionId}` });
      }
    }
    const existingSections = await GlobalSectionModel.find({
      _id: { $in: sectionIds }
    });
    if (existingSections.length !== sectionIds.length) {
      return res.status(404).json({ message: "One or more sectionIds not found." });
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Questions must be a non-empty array." });
    }
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const {type, questionText, marks, difficultyLevel,  options, answerType, correctAnswer, blanks, passage, subQuestions } = question;
      if (!type || !questionText || !marks || !difficultyLevel) {
        return res.status(400).json({
          message: `Question ${i + 1}: Missing required fields (type, questionText, marks, difficultyLevel).`,
        });
      }
      switch (type) {
        case "mcq":
          if (!answerType) {
            return res.status(400).json({
              message: `Question ${i + 1}: MCQ questions must have answerType.`,
            });
          }
          if (!Array.isArray(options) || options.length !== 4) {
            return res.status(400).json({
              message: `Question ${i + 1}: MCQ questions must have exactly 4 options.`,
            });
          }
          const hasCorrectOption = options.some(opt => opt.isCorrect === true);
          if (!hasCorrectOption) {
            return res.status(400).json({
              message: `Question ${i + 1}: MCQ questions must have at least one correct option.`,
            });
          }
          break;
        case "truefalse":
          if (correctAnswer === undefined || typeof correctAnswer !== "boolean") {
            return res.status(400).json({
              message: `Question ${i + 1}: True/False questions must have a boolean correctAnswer.`,
            });
          }
          break;
        case "fillintheblank":
          if (!Array.isArray(blanks) || blanks.length === 0) {
            return res.status(400).json({
              message: `Question ${i + 1}: Fill-in-the-blank questions must have at least one blank.`,
            });
          }
          for (const blank of blanks) {
            if (!blank.id || !blank.correctAnswer) {
              return res.status(400).json({
                message: `Question ${i + 1}: Each blank must have id and correctAnswer.`,
              });
            }
          }
          break;
        case "integerType":
          if (correctAnswer === undefined || typeof correctAnswer !== "number" || !Number.isInteger(correctAnswer)) {
            return res.status(400).json({
              message: `Question ${i + 1}: Integer questions must have a numeric correctAnswer.`,
            });
          }
          break;
        case "comprehension":
          if (!passage) {
            return res.status(400).json({
              message: `Question ${i + 1}: Comprehension questions must have a passage.`,
            });
          }
          if (!Array.isArray(subQuestions) || subQuestions.length === 0) {
            return res.status(400).json({
              message: `Question ${i + 1}: Comprehension questions must have at least one sub-question.`,
            });
          }
          for (let j = 0; j < subQuestions.length; j++) {
            const subQ = subQuestions[j];
            if (!subQ.type || !subQ.questionText ) {
              return res.status(400).json({
                message: `Question ${i + 1}, Sub-question ${j + 1}: Missing required fields.`,
              });
            }
            if (subQ.type === "mcq" && (!subQ.options || subQ.options.length !== 4)) {
              return res.status(400).json({
                message: `Question ${i + 1}, Sub-question ${j + 1}: MCQ must have 4 options.`,
              });
            }
          }
          break;
        default:
          return res.status(400).json({
            message: `Question ${i + 1}: Invalid question type '${type}'.`,
          });
      }
      question.sectionId = sectionIds;
    }
    const insertedQuestions = await globalQuestionModel.insertMany(questions);
    return res.status(201).json({
      message: `${insertedQuestions.length} question(s) created successfully.`,
      questions: insertedQuestions,
    });
  } catch (error) {
    console.error("Error creating questions:", error);
    return res.status(500).json({
      message: "An error occurred while creating the questions.",
      error: error.message
    });
  }
};
exports.editQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const updateData = req.body;
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: "Invalid questionId format." });
    }
    const existingQuestion = await globalQuestionModel.findById(questionId);
    if (!existingQuestion) {
      return res.status(404).json({ message: "Question not found." });
    }
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
      negativeMarking,
      negativeMarksValue
    } = updateData;

    if (!type || !questionText || !marks || !difficultyLevel) {
      return res.status(400).json({
        message: "Missing required fields (type, questionText, marks, difficultyLevel).",
      });
    }
    if (negativeMarking !== undefined && typeof negativeMarking !== 'boolean') {
      return res.status(400).json({ message: 'negativeMarking must be a boolean.' });
    }
    if (negativeMarking && (negativeMarksValue === undefined || typeof negativeMarksValue !== 'number' || negativeMarksValue < 0)) {
      return res.status(400).json({ message: 'negativeMarksValue must be a non-negative number when negativeMarking is true.' });
    }
    switch (type) {
      case "mcq":
        if (!answerType) {
          return res.status(400).json({ message: "MCQ questions must have answerType." });
        }
        if (!Array.isArray(options) || options.length !== 4) {
          return res.status(400).json({ message: "MCQ questions must have exactly 4 options." });
        }
        const hasCorrectOption = options.some(opt => opt.isCorrect === true);
        if (!hasCorrectOption) {
          return res.status(400).json({ message: "MCQ questions must have at least one correct option." });
        }
        break;

      case "truefalse":
        if (correctAnswer === undefined || typeof correctAnswer !== "boolean") {
          return res.status(400).json({ message: "True/False questions must have a boolean correctAnswer." });
        }
        break;

      case "fillintheblank":
        if (!Array.isArray(blanks) || blanks.length === 0) {
          return res.status(400).json({ message: "Fill-in-the-blank questions must have at least one blank." });
        }
        for (const blank of blanks) {
          if (!blank.id || !blank.correctAnswer) {
            return res.status(400).json({ message: "Each blank must have id and correctAnswer." });
          }
        }
        break;

      case "integerType":
        if (correctAnswer === undefined || typeof correctAnswer !== "number" || !Number.isInteger(correctAnswer)) {
          return res.status(400).json({ message: "Integer questions must have a numeric correctAnswer." });
        }
        break;

      case "comprehension":
        if (!passage) {
          return res.status(400).json({ message: "Comprehension questions must have a passage." });
        }
        if (!Array.isArray(subQuestions) || subQuestions.length === 0) {
          return res.status(400).json({ message: "Comprehension questions must have at least one sub-question." });
        }
        for (let j = 0; j < subQuestions.length; j++) {
          const subQ = subQuestions[j];
          if (!subQ.type || !subQ.questionText || !subQ.marks) {
            return res.status(400).json({ message: `Sub-question ${j + 1}: Missing required fields.` });
          }
          if (subQ.type === "mcq" && (!subQ.options || subQ.options.length !== 4)) {
            return res.status(400).json({ message: `Sub-question ${j + 1}: MCQ must have 4 options.` });
          }
        }
        break;
      default:
        return res.status(400).json({ message: `Invalid question type '${type}'.` });
    }
    const updatedQuestion = await globalQuestionModel.findByIdAndUpdate(
      questionId,
      updateData,
      { new: true, runValidators: true } 
    );
    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found after update attempt." });
    }
    return res.status(200).json({
      message: "Question updated successfully.",
      question: updatedQuestion,
    });

  } catch (error) {
    console.error("Error updating question:", error);
    // Handle Mongoose validation errors separately if needed
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message, errors: error.errors });
    }
    return res.status(500).json({
      message: "An error occurred while updating the question.",
      error: error.message
    });
  }
}
exports.deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    
    const question = await globalQuestionModel.findById(questionId);
    if (!question ) {
      return res.status(404).json({ message: "Question not found." });
    }
   
    await globalQuestionModel.findByIdAndDelete(questionId);

    return res.status(200).json({
      message: "Question deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
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
        globalFileModel.find(filter).populate('tag', 'title').lean(),
        globalFolderModel.find(filter).lean(),
      ]);

      // Add children count to each folder
      const foldersWithChildrenCount = await Promise.all(
        folders.map(async (folder) => {
          const fileCount = await globalFileModel.countDocuments({ parentId: folder._id });
          const folderCount = await globalFolderModel.countDocuments({ parentId: folder._id });
          return { ...folder, children: fileCount + folderCount };
        })
      );

      children = [...files, ...foldersWithChildrenCount];

      responseData = {
        _id: "Global-library",
        name: "Global Library",
        type: "folder",
        parentId: null,
        level: 0,
        date: new Date().toLocaleDateString("en-GB"),
        children,
      };

      return res.status(200).json({ data: responseData });

    } else {
      const parentFolder = await globalFolderModel.findById(parentId).lean();
      if (!parentFolder) {
        return res.status(404).json({ message: "Parent folder not found" });
      }

      filter = { parentId: parentId, level: { $ne: 0 } };

      const [files, folders] = await Promise.all([
        globalFileModel.find(filter).lean(),
        globalFolderModel.find(filter).lean(),
      ]);

      // Add children count to each folder
      const foldersWithChildrenCount = await Promise.all(
        folders.map(async (folder) => {
          const fileCount = await globalFileModel.countDocuments({ parentId: folder._id });
          const folderCount = await globalFolderModel.countDocuments({ parentId: folder._id });
          return { ...folder, children: fileCount + folderCount };
        })
      );

      children = [...files, ...foldersWithChildrenCount];

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
    const file = await globalFileModel.findById(sectionId)
    const sections = await GlobalSectionModel.find( {parentId : sectionId} )
    const data = {
      ...file.toObject(),
      sections: sections
    };
    res.status(200).json({ message : "Fetching successfully" , data });
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

    // Step 1: Find the test/file from globalFileModel
    const testFile = await globalFileModel.findById(fileId).lean();
    
    if (!testFile) {
      return res.status(404).json({ message: "Test/File not found with this ID." });
    }

    // Step 2: Find all sections having parentId = testId
    const sections = await GlobalSectionModel.find({ parentId: fileId }).lean();
    
    if (sections.length === 0) {
      return res.status(404).json({ message: "No sections found for this file ID." });
    }

    // Step 3: Get all section IDs
    const sectionIds = sections.map(sec => sec._id);

    // Step 4: Find all questions for these sections
    const allQuestions = await questionModel.find({ 
      sectionId: { $in: sectionIds } 
    }).lean();

    // Step 5: Create a question map grouped by sectionId
    const questionMap = {};
    allQuestions.forEach(question => {
      // Handle the case where sectionId might be an array
      const sectionIdArray = Array.isArray(question.sectionId) ? question.sectionId : [question.sectionId];
      
      sectionIdArray.forEach(sId => {
        const sectionIdStr = sId.toString();
        if (!questionMap[sectionIdStr]) {
          questionMap[sectionIdStr] = [];
        }
        questionMap[sectionIdStr].push(question);
      });
    });

    // Step 6: Create enriched sections with questions and additional details
    const enrichedSections = sections.map(section => {
      const sectionQuestions = questionMap[section._id.toString()] || [];
      const totalQuestions = sectionQuestions.length;
      const totalMarks = sectionQuestions.reduce((sum, question) => sum + (question.marks || 0), 0);
      
      return {
        ...section,
        totalQuestions,
        totalMarks,
        questions: sectionQuestions
      };
    });

    // Step 7: Create the final response structure with additional test details
    const response = {
      test: {
        ...testFile,
        numberOfSections: enrichedSections.length,
        sections: enrichedSections
      }
    };

    res.status(200).json({ data: response });

  } catch (error) {
    console.error("Error fetching sections with questions:", error);
    res.status(500).json({ 
      message: "Failed to fetch sections with questions", 
      error: error.message 
    });
  }
};
exports.getQuestionsBySectionId = async (req, res) => {
  try {
    const { sectionId } = req.params;

    if (!sectionId || !mongoose.Types.ObjectId.isValid(sectionId)) {
      return res.status(400).json({ message: "Valid sectionId parameter is required." });
    }
    const questions = await questionModel.find({
      sectionId: new mongoose.Types.ObjectId(sectionId)
    }).populate("chapterName","chapterName").populate("topic","topic").populate("class","class").populate("course","course").populate("subject","subject").lean();

    res.status(200).json({ questions });

  } catch (error) {
    console.error("Error fetching questions by sectionId:", error);
    res.status(500).json({ message: "Failed to fetch questions", error: error.message });
  }
};
exports.importQuestionsInSection = async (req, res) => {
  const { sectionId } = req.params;
  const { questionIds } = req.body;
  if (
    !Array.isArray(questionIds) ||
    questionIds.length < 0 ||
    !mongoose.Types.ObjectId.isValid(sectionId)
  ) {
    return res.status(400).json({
      message: 'Invalid input. At least two valid question IDs and a valid sectionId are required.'
    });
  }

  try {
    const sectionObjectId = new mongoose.Types.ObjectId(sectionId);

    const updatePromises = questionIds.map(id =>
      questionModel.updateOne(
        { _id: id },
        { $addToSet: { sectionId: sectionObjectId } }
      )
    );

    await Promise.all(updatePromises);

    res.status(200).json({ message: "Questions imported successfully." });
  } catch (error) {
    console.error("Error importing questions:", error);
    res.status(500).json({
      message: "Failed to import questions",
      error: error.message
    });
  }
};
exports.getSectionsByFileId = async (req,res) =>{
    const {fileId} = req.params;
  try {
    const sections = await GlobalSectionModel.find({parentId : fileId});
    const test = await globalFileModel.findById(fileId);
    res.status(200).json({test,sections})
  } catch (error) {
    console.error("Error fetching sections with questions:", error);
    res.status(500).json({ message: "Failed to fetch sections with questions", error: error.message });
  }
}
exports.getSectionsWithQuestionsByParentIds = async (req, res) => {
  try {
    const { sectionId } = req.params;
    if (!sectionId) {
      return res.status(400).json({ message: "sectionId query parameter is required." });
    }
    const sections = await GlobalSectionModel.findById( sectionId )
     const questions = await questionModel.find({
      sectionId: new mongoose.Types.ObjectId(sectionId)
    }).lean();
    sections.questions = questions;
    res.status(200).json({ sections });
  } catch (error) {
    console.error("Error fetching sections with questions:", error);
    res.status(500).json({ message: "Failed to fetch sections with questions", error: error.message });
  }
};

exports.getAllData = async (req, res) => {
   const userId = req.user?._id;
  try {
    const questions = await questionModel.find({createdBy : "admin"}).select("number type subject chapterName topic difficultyLevel resource previousYearsQuestion numberOfQuestionImport category").sort({createdAt : -1}).lean();
    return res.status(200).json({message : "Fetched Question successfully" , questions});

  } catch (error) {
     console.error("Error updating question:", error)
    return res.status(500).json({
      message: "An error occurred while updating the question.",
      error: error.message
    });
  }
}

exports.getAllDataAdmin = async (req,res) =>{
  try {
    const test = await globalFileModel.find().populate("parentId", "name").lean();
    return res.status(200).json({message : "Fetched test successfully" , test});
  } catch (error) {
      console.error("Error updating question:", error)
    return res.status(500).json({
      message: "An error occurred while updating the question.",
      error: error.message
    });
  }
}