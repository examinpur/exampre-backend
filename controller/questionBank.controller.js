const { questionModel } = require("../model/Questions");
const { questionBankModel } = require("../model/QuestionBank");
const { default: mongoose } = require("mongoose");


exports.createQuestionBank = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      chapterName,
      topic,
      level,
      parentId,
      createdBy,
    } = req.body;

    if (!title || !subject || !createdBy) {
      return res.status(400).json({
        message: "Missing required fields (title, subject, createdBy)."
      });
    }

    let levels = 0;

    if (parentId) {
      const parentBank = await questionBankModel.findById(parentId);
      if (!parentBank) {
        return res.status(404).json({
          message: "Parent question bank not found."
        });
      }
      levels = parentBank.levels + 1;
    }

    const newQuestionBank = new questionBankModel({
      title,
      description,
      subject,
      chapterName,
      topic,
      level,
      parentId: parentId ?? null,
      levels,
      createdBy,
    });

    const savedBank = await newQuestionBank.save();

    return res.status(201).json({
      message: "Question bank created successfully.",
      questionBank: savedBank
    });

  } catch (error) {
    console.error("Error creating question bank:", error);
    return res.status(500).json({
      message: "An error occurred while creating the question bank.",
      error: error.message
    });
  }
};

exports.updateQuestionBank = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid question bank id format." });
    }

    // If parentId is being updated — recalculate levels
    if (updateData.parentId) {
      const parentBank = await questionBankModel.findById(updateData.parentId);
      if (!parentBank) {
        return res.status(404).json({ message: "Parent question bank not found." });
      }
      updateData.levels = parentBank.levels + 1;
    } else if (updateData.parentId === null) {
      updateData.levels = 0;
    }

    const updatedBank = await questionBankModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedBank) {
      return res.status(404).json({ message: "Question bank not found." });
    }

    return res.status(200).json({
      message: "Question bank updated successfully.",
      questionBank: updatedBank
    });

  } catch (error) {
    console.error("Error updating question bank:", error);
    return res.status(500).json({
      message: "An error occurred while updating the question bank.",
      error: error.message
    });
  }
};

exports.getQuestionBanksAndQuestions = async (req, res) => {
  try {
    const { parentId, searchText,  resource, negativeMarking, difficulty } = req.query;

    let questionBanks = [];
    let questions = [];

    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ message: "Invalid parentId format." });
      }
      questionBanks = await questionBankModel.find({ parentId });
    } else {
      questionBanks = await questionBankModel.find({ parentId: null, levels: 0 });
    }

    const questionBankIds = questionBanks.map(bank => bank._id);

    if (parentId) {
      let questionQuery = { questionBankParentId: parentId };

      // if (previousYears) questionQuery.previousYearsQuestion = previousYears;
      if (resource) questionQuery.resource = resource;
      if (negativeMarking) questionQuery.negativeMarking = negativeMarking;
      if (difficulty) questionQuery.difficultyLevel = difficulty;

      if (searchText) {
        questionQuery.questionText = { $regex: searchText, $options: 'i' };
      }
      questions = await questionModel.find(questionQuery).select('number type');
    } else {
      let questionQuery = { questionBankParentId: { $in: questionBankIds } };

      if (searchText) {
        questionQuery.questionText = { $regex: searchText, $options: 'i' };
      }

      questions = await questionModel.find(questionQuery);
    }

    return res.status(200).json({
      message: "Fetched question banks and questions successfully.",
      questionBanks,
      questions
    });

  } catch (error) {
    console.error("Error fetching question banks and questions:", error);
    return res.status(500).json({
      message: "An error occurred while fetching data.",
      error: error.message
    });
  }
};

exports.deleteQuestionBank = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid question bank id format." });
    }

    const bankToDelete = await questionBankModel.findById(id);
    if (!bankToDelete) {
      return res.status(404).json({ message: "Question bank not found." });
    }

    await questionBankModel.findByIdAndDelete(id);

    const deletedQuestions = await questionModel.deleteMany({
      questionBankParentId: id
    });

    return res.status(200).json({
      message: "Question bank and its associated questions deleted successfully.",
      deletedQuestionsCount: deletedQuestions.deletedCount
    });

  } catch (error) {
    console.error("Error deleting question bank:", error);
    return res.status(500).json({
      message: "An error occurred while deleting the question bank.",
      error: error.message
    });
  }
};

exports.getAllData = async (req, res) => {
  try {
const questionBanks = await questionBankModel
  .find()
  .select("title subject chapterName topic")
  .populate({
    path: "subject",
    select: "subject classId",
    populate: {
      path: "classId",
      model: "classes",
      select: "class", 
    },
  })
  .populate("chapterName", "chapterName")
  .populate("topic", "topic")
  .lean();

    for (let questionBank of questionBanks) {
      const questions = await questionModel.find({ questionBankParentId: questionBank._id }).select('number type').lean();
      questionBank.questions = questions;
    }

    return res.status(200).json({
      message: "Fetched all question banks and their questions successfully.",
      data: questionBanks
    });

  } catch (error) {
    console.error("Error fetching all data:", error);
    return res.status(500).json({
      message: "An error occurred while fetching all question banks.",
      error: error.message
    });
  }
};


exports.getAllFolders = async (req, res) =>{
  try {
    const questionBanks = await questionBankModel.find().select("title parentId").populate("parentId" , "title").lean();
    return res.status(200).json({
      message: "Fetched all question banks and their questions successfully.",
      data: questionBanks
    });
  } catch (error) {
     console.error("Error fetching all data:", error);
    return res.status(500).json({
      message: "An error occurred while fetching all question banks.",
      error: error.message
    });
  }
}