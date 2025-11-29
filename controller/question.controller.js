const { default: mongoose } = require("mongoose");
const { questionBankModel } = require("../model/QuestionBank");
const { questionModel } = require("../model/Questions");
const { solutionModel } = require("../model/solutionModel");
const mammoth = require('mammoth');
const fs = require('fs');

exports.createQuestions = async (req, res) => {
  try {
    const {
      questions,
      questionBankParentId,
      createdBy,
      years,
      previousYearsQuestion = false,
      resource = '',
    } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Questions must be a non-empty array." });
    }
    const questionBanks = await questionBankModel.findById(questionBankParentId);
    const existingCount = await questionModel.countDocuments();
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
      } = question;

      if (!type || !questionText || !marks || !difficultyLevel) {
        return res.status(400).json({
          message: `Question ${i + 1}: Missing required fields (type, questionText, marks, difficultyLevel).`,
        });
      }
      switch (type) {
        case "mcq":
          if (!answerType) {
            return res.status(400).json({ message: `Question ${i + 1}: MCQ questions must have answerType.` });
          }
          if (!Array.isArray(options) || options.length !== 4) {
            return res.status(400).json({ message: `Question ${i + 1}: MCQ questions must have exactly 4 options.` });
          }
          const hasCorrectOption = options.some(opt => opt.isCorrect === true);
          if (!hasCorrectOption) {
            return res.status(400).json({ message: `Question ${i + 1}: MCQ must have at least one correct option.` });
          }
          break;

        case "truefalse":
          if (correctAnswer === undefined || typeof correctAnswer !== "boolean") {
            return res.status(400).json({ message: `Question ${i + 1}: True/False must have a boolean correctAnswer.` });
          }
          break;

        case "fillintheblank":
          if (!Array.isArray(blanks) || blanks.length === 0) {
            return res.status(400).json({ message: `Question ${i + 1}: Fill-in-the-blank must have at least one blank.` });
          }
          for (const blank of blanks) {
            if (!blank.id || !blank.correctAnswer) {
              return res.status(400).json({ message: `Question ${i + 1}: Each blank must have id and correctAnswer.` });
            }
          }
          break;

        case "integerType":
          if (correctAnswer === undefined ) {
            return res.status(400).json({ message: `Question ${i + 1}: Integer questions must have a numeric correctAnswer.` });
          }
          break;

        case "comprehension":
          if (!passage) {
            return res.status(400).json({ message: `Question ${i + 1}: Comprehension must have a passage.` });
          }
          if (!Array.isArray(subQuestions) || subQuestions.length === 0) {
            return res.status(400).json({ message: `Question ${i + 1}: Comprehension must have at least one sub-question.` });
          }
          for (let j = 0; j < subQuestions.length; j++) {
            const subQ = subQuestions[j];
            if (!subQ.type || !subQ.questionText) {
              return res.status(400).json({ message: `Question ${i + 1}, Sub-question ${j + 1}: Missing required fields.` });
            }
            if (subQ.type === "mcq" && (!Array.isArray(subQ.options) || subQ.options.length !== 4)) {
              return res.status(400).json({ message: `Question ${i + 1}, Sub-question ${j + 1}: MCQ must have 4 options.` });
            }
          }
          break;

        default:
          return res.status(400).json({ message: `Question ${i + 1}: Invalid question type '${type}'.` });
      }
      question.questionBankParentId = questionBankParentId ?? null;
      question.createdBy = createdBy;
      question.subject = questionBanks.subject;
      question.chapterName = questionBanks.chapterName;
      question.topic = questionBanks.topic;
      question.previousYearsQuestion = previousYearsQuestion;
      question.years = years;
      question.resource = resource;
      question.number = existingCount + i + 1;
    }

    const insertedQuestions = await questionModel.insertMany(questions);
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
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid questionId format." });
    }

    const existingQuestion = await questionModel.findById(id);
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
      negativeMarksValue,
      createdBy,
      questionBankParentId,
      subject,
      chapterName,
      subtopic,
      previousYearsQuestion,
      resource
    } = updateData;
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
        if (correctAnswer === undefined) {
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
          if (!subQ.type || !subQ.questionText || subQ.marks === undefined) {
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
    const updatedQuestion = await questionModel.findByIdAndUpdate(
      id,
      {
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
        negativeMarksValue,
        createdBy,
        questionBankParentId,
        subject,
        chapterName,
        subtopic,
        previousYearsQuestion,
        resource
      },
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
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message, errors: error.errors });
    }
    return res.status(500).json({
      message: "An error occurred while updating the question.",
      error: error.message
    });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await questionModel.findById(id);
    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }
    const deletedQuestionNumber = question.number;
    await questionModel.findByIdAndDelete(id);
    await questionModel.updateMany(
      { number: { $gt: deletedQuestionNumber } },
      { $inc: { number: -1 } }
    );
    return res.status(200).json({
      message: "Question deleted and subsequent question numbers updated successfully.",
    });
  } catch (error) {
    console.error("Error deleting question:", error);
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

exports.getQuestionById = async (req,res) =>{
  const {id} = req.params;
  try {
    const question = await questionModel.findById(id).populate("class" , "class").populate("subject" , "subject").populate("chapterName" , "chapterName").populate("topic" , "topic").populate("course" , "course");
    if(!question){
      return res.status(400).json({message : "Question Not found, Try later."})
    }
      const solution = await solutionModel.findOne({questionId : id});
      const data = {
        question , solution
      }
      return res.status(200).json({message : "Fetched Question successfully" , data});

  } catch (error) {
     console.error("Error updating question:", error)
    return res.status(500).json({
      message: "An error occurred while updating the question.",
      error: error.message
    });
  }
}

exports.getAllQuestions = async (req,res) =>{
      const userId = req.user?._id;
  try {
    const questions = await questionModel.find({createdBy : userId}).select("number type subject chapterName topic difficultyLevel resource previousYearsQuestion numberOfQuestionImport category class").sort({createdAt : -1}).lean();
    return res.status(200).json({message : "Fetched Question successfully" , questions});

  } catch (error) {
     console.error("Error updating question:", error)
    return res.status(500).json({
      message: "An error occurred while updating the question.",
      error: error.message
    });
  }
}

exports.uploadQuestionsWithDoc = async (req, res) => {
 const userId = req.user?._id;
 const {sectionId} = req.params;
 try {
   if (!req.file) {
     return res.status(400).json({
       message: "No file uploaded",
       success: false
     });
   }
   
   if (!sectionId) {
     return res.status(400).json({
       message: "sectionId is required",
       success: false
     });
   }

   let sectionIds = [];
   if (typeof sectionId === 'string') {
     sectionIds = [new mongoose.Types.ObjectId(sectionId)];
   } else if (Array.isArray(sectionId)) {
     sectionIds = sectionId.map(id => new mongoose.Types.ObjectId(id));
   }

   const result = await mammoth.extractRawText({ path: req.file.path });
   const documentText = result.value;

   const parsedQuestions = parseQuestionsFromDocument(documentText);
   
   if (parsedQuestions.length === 0) {
     fs.unlinkSync(req.file.path);
     return res.status(400).json({
       message: "No valid questions found in the document",
       success: false
     });
   }

   const lastQuestion = await questionModel.findOne().sort({ number: -1 });
   let questionNumber = lastQuestion ? lastQuestion.number + 1 : 1;

   const questionsToInsert = parsedQuestions.map(question => ({
     ...question,
     sectionId: sectionIds,
     createdBy: new mongoose.Types.ObjectId(userId),
     number: questionNumber++,
     questionBankParentId: req.body.questionBankParentId ? 
       new mongoose.Types.ObjectId(req.body.questionBankParentId) : null
   }));

   const insertedQuestions = await questionModel.insertMany(questionsToInsert);

   fs.unlinkSync(req.file.path);

   return res.status(201).json({
     message: "Questions uploaded successfully",
     success: true,
     data: {
       questionsCount: insertedQuestions.length,
       questions: insertedQuestions
     }
   });

 } catch (error) {
   if (req.file && fs.existsSync(req.file.path)) {
     fs.unlinkSync(req.file.path);
   }
   
   console.error("Error uploading questions from document:", error);
   return res.status(500).json({
     message: "An error occurred while processing the document",
     error: error.message,
     success: false
   });
 }
};

function parseQuestionsFromDocument(text) {
  const questions = [];
  
  // Split by lines and process sequentially
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  let currentQuestion = null;
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    
    // Start of new question
    if (line === 'Question') {
      // Save previous question if exists
      if (currentQuestion && currentQuestion.questionText) {
        questions.push(currentQuestion);
      }
      
      // Initialize new question
      currentQuestion = {
        questionText: '',
        type: 'mcq',
        options: [],
        blanks: [],
        correctAnswer: null,
        solution: '',
        marks: 1,
        negativeMarking: false,
        negativeMarksValue: 0,
        difficultyLevel: 'easy',
        subject: '',
        chapterName: '',
        topic: '',
        resource: '',
        previousYearsQuestion: false,
        year: '',
        titles: [],
        passage: ''
      };
      
      // Get question text from next line
      if (i + 1 < lines.length) {
        currentQuestion.questionText = lines[i + 1];
        i += 2; // Skip question text line
        continue;
      }
    }
    
    if (!currentQuestion) {
      i++;
      continue;
    }
    
    // Parse different fields
    if (line === 'type' && i + 1 < lines.length) {
      const type = lines[i + 1];
      if (['mcq', 'truefalse', 'fillintheblank', 'integerType'].includes(type)) {
        currentQuestion.type = type;
      }
      i += 2;
      continue;
    }
    
    if (line === 'Option' && i + 2 < lines.length) {
      const optionText = lines[i + 1];
      const isCorrect = lines[i + 2] === 'correct';
      
      if (optionText !== '-') {
        currentQuestion.options.push({
          text: optionText,
          isCorrect: isCorrect
        });
      }
      i += 3;
      continue;
    }
    
    if (line === 'Blanks' && i + 2 < lines.length && lines[i + 1] === 'correctAnswer') {
      const answer = lines[i + 2];
      if (answer !== '-') {
        currentQuestion.blanks.push({
          correctAnswer: answer
        });
      }
      i += 3;
      continue;
    }
    
    if (line === 'correctAnswer' && i + 1 < lines.length) {
      const answer = lines[i + 1];
      if (answer !== '-') {
        if (currentQuestion.type === 'integertype' || currentQuestion.type === 'integerType') {
          const numMatch = answer.match(/(\d+)/);
          currentQuestion.correctAnswer = numMatch ? parseInt(numMatch[1]) : 0;
        } else {
          currentQuestion.correctAnswer = answer;
        }
      }
      i += 2;
      continue;
    }
    
    if (line === 'Solution' && i + 1 < lines.length) {
      let solution = lines[i + 1];
      let j = i + 2;
      
      // Collect multi-line solutions
      while (j < lines.length && !['Question', 'Marks', 'NegativeMarksValue'].includes(lines[j])) {
        if (lines[j] !== '-') {
          solution += ' ' + lines[j];
        }
        j++;
      }
      
      currentQuestion.solution = solution === '-' ? '' : solution;
      i = j;
      continue;
    }
    
    if (line === 'solution' && i + 1 < lines.length) {
      currentQuestion.solution = lines[i + 1] === '-' ? '' : lines[i + 1];
      i += 2;
      continue;
    }
    
    if (line === 'Marks' && i + 1 < lines.length) {
      currentQuestion.marks = parseInt(lines[i + 1]) || 1;
      i += 2;
      continue;
    }
    
    if (line === 'NegativeMarksValue' && i + 1 < lines.length) {
      const negValue = parseFloat(lines[i + 1]) || 0;
      currentQuestion.negativeMarksValue = negValue;
      currentQuestion.negativeMarking = negValue > 0;
      i += 2;
      continue;
    }
    
    if (line === 'DifficultyLevel' && i + 1 < lines.length) {
      const difficulty = lines[i + 1].toLowerCase();
      currentQuestion.difficultyLevel = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'easy';
      i += 2;
      continue;
    }
    
    if (line === 'subject' && i + 1 < lines.length) {
      currentQuestion.subject = lines[i + 1] === '-' ? '' : lines[i + 1];
      i += 2;
      continue;
    }
    
    if (line === 'chapterName' && i + 1 < lines.length) {
      currentQuestion.chapterName = lines[i + 1] === '-' ? '' : lines[i + 1];
      i += 2;
      continue;
    }
    
    if (line === 'topic' && i + 1 < lines.length) {
      currentQuestion.topic = lines[i + 1] === '-' ? '' : lines[i + 1];
      i += 2;
      continue;
    }
    
    if (line === 'resources' && i + 1 < lines.length) {
      currentQuestion.resource = lines[i + 1] === '-' ? '' : lines[i + 1];
      i += 2;
      continue;
    }
    
    if ((line === 'previousYear' || line === 'previousYearsQuestion') && i + 1 < lines.length) {
      currentQuestion.previousYearsQuestion = lines[i + 1] === 'true';
      i += 2;
      continue;
    }
    
    if (line === 'year' && i + 1 < lines.length) {
      currentQuestion.year = lines[i + 1] === '-' ? '' : lines[i + 1];
      i += 2;
      continue;
    }
    
    if (line === 'titles' && i + 1 < lines.length) {
      const titlesValue = lines[i + 1];
      currentQuestion.titles = titlesValue === '-' ? [] : titlesValue.split(',').map(t => t.trim());
      i += 2;
      continue;
    }
    
    i++;
  }
  
  // Add the last question
  if (currentQuestion && currentQuestion.questionText) {
    questions.push(currentQuestion);
  }
  
  // Process questions to set correct answer types and validate
  return questions.map(question => {
    if (question.type === 'mcq' && question.options.length > 0) {
      const correctOptions = question.options.filter(opt => opt.isCorrect);
      question.answerType = correctOptions.length > 1 ? 'multiple' : 'single';
    }
    
    if (question.type === 'truefalse') {
      if (question.options.length === 0) {
        question.options = [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: false }
        ];
      }
      
      // Set correct option based on existing options
      const trueOption = question.options.find(opt => opt.text === 'True');
      const falseOption = question.options.find(opt => opt.text === 'False');
      
      if (trueOption && trueOption.isCorrect) {
        question.correctAnswer = true;
      } else if (falseOption && falseOption.isCorrect) {
        question.correctAnswer = false;
      }
      
      question.answerType = 'single';
    }
    
    return question;
  }).filter(q => q.questionText.trim().length > 0);
}
exports.getShuffledQuestions = async (req, res) => {
  try {
    const { sectionId, numberOfQuestions, subject, difficultyLevel, type } = req.body;

    if (!sectionId || !numberOfQuestions) {
      return res.status(400).json({ message: "sectionId and numberOfQuestions are required." });
    }

    const sectionObjectId = new mongoose.Types.ObjectId(sectionId);

    // Build $match stage dynamically
    const matchStage = {};
    if (type) matchStage.type = type;
    if (subject) matchStage.subject = subject;
    if (difficultyLevel) matchStage.difficultyLevel = difficultyLevel;

    // Aggregate with $match and $sample
    const questions = await questionModel.aggregate([
      { $match: matchStage },
      { $sample: { size: parseInt(numberOfQuestions) } },
    ]);

    if (!questions.length) {
      return res.status(404).json({ message: "No matching questions found." });
    }

    // Update sectionId if not already in question.sectionId
    const updatePromises = questions.map(async (q) => {
      const existing = await questionModel.findById(q._id);

      if (!existing.sectionId.some(id => id.equals(sectionObjectId))) {
        existing.sectionId.push(sectionObjectId);
        await existing.save();
      }
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      message: `${questions.length} questions added to section successfully.`,
      addedQuestions: questions.map(q => q._id),
    });
  } catch (error) {
    console.error("Error in getShuffledQuestions:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

exports.resetQuestionImportCount = async (req, res) => {
  const { questionIds } = req.params;
  const userId = req.user?._id;
  
  if (!userId) {
    return res.status(401).json({
      message: 'Authentication required.'
    });
  }
  try {
    const result = await questionModel.findById(
      { 
        _id:  questionIds ,
        createdBy: userId 
      }
    );

    if (result) {
      result.numberOfQuestionImport.count = 0;
      result.numberOfQuestionImport.test = [];
      await result.save();
    }

    res.status(200).json({
      message: "Question import counts reset successfully.",
      modifiedCount: result.modifiedCount,
      totalRequested: questionIds.length
    });

  } catch (error) {
    console.error("Error resetting question import counts:", error);
    res.status(500).json({
      message: "Failed to reset question import counts",
      error: error.message
    });
  }
};
