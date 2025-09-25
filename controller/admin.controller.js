const { adminModel } = require("../model/Admin");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const { batchModel } = require("../model/batch");
const { default: mongoose } = require("mongoose");
const { questionBankModel } = require("../model/QuestionBank");
const { questionModel } = require("../model/Questions");

const validateBatchInput = (body) => {
  const {
    title, startingDate, batchCode,
    subject, fees
  } = body;
  if (!title || title.trim() === '') return 'Title is required.';
  if (title.length > 100) return 'Title cannot exceed 100 characters.';

  if (!startingDate) return 'Starting date is required.';
  if (!batchCode || batchCode.trim() === '') return 'Batch code is required.';
  if (!subject || !Array.isArray(subject) || subject.length === 0) return 'At least one subject is required.';
  if (!fees || typeof fees.amount !== 'number') return 'Fees amount must be a number.';

  return null;
};

exports.createNewAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const existingAdmin = await adminModel.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin already exists with this email." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new adminModel({
      name,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign(
      { adminId: admin._id, },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(200).json({ message: "Login successful", token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createbatch = async (req, res) => {
  try {
    const errorMessage = validateBatchInput(req.body);
    if (errorMessage) return res.status(400).json({ error: errorMessage });

    const {
      title,
      description,
      startingDate,
      batchCode,
      subject,
      course,
      fees,
      test
      
    } = req.body;

    const createdBy = "admin";

    const newBatch = new batchModel({
      title,
      description,
      startingDate,
      createdBy,
      batchCode,
      subject,
      course,
      test,
      fees,
    });

    await newBatch.save();
    res.status(201).json({ message: "Batch created successfully", batchId: newBatch._id });
  } catch (err) {
    console.error("Error creating batch:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllbatchs = async (req, res) => {
  try {
    const batches = await batchModel.find()
      .populate('subject',"subject")
      .populate('course',"course")
      .populate({
        path: 'test',
        model: 'GlobalLibraryFiles',
        select: 'name' 
      })
      .populate({
        path: 'students.studentId',
        model: 'Student'
      });

    res.status(200).json(batches);
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


exports.getbatchById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid batch ID format.' });
  }

  try {
    const batch = await batchModel
      .findById(id)
      .populate('createdBy')
      .populate('subject', 'subject')
      .populate('course', 'course')
      .populate({
        path: 'test',
        model: 'GlobalLibraryFiles',
        populate: {
          path: 'parentId',
          model: 'GlobalLibraryFiles', // populate parent if present
        }
      })
      .populate({
        path: 'students.studentId',
        model: 'Student',
        select: 'name email'
      });

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found.' });
    }

    // Format students
    const processedStudents = (batch.students || []).map(s => {
      if (s.studentId && s.studentId.name && s.studentId.email) {
        return {
          studentId: s.studentId._id,
          name: s.studentId.name,
          email: s.studentId.email,
          enrollmentDate: s.enrollmentDate,
          enrollmentStatus: s.enrollmentStatus,
          progress: s.progress
        };
      }
      return null;
    }).filter(Boolean);

    // Prepare response
    const responseData = {
      ...batch._doc,
      students: processedStudents,
      fees: batch.fees && batch.fees.amount > 0
        ? batch.fees
        : { amount: 0, currency: 'INR', note: 'Free' }
    };

    res.status(200).json({ message: "Fetched", batch: responseData });
  } catch (err) {
    console.error("Error in getbatchById:", err);
    res.status(500).json({ error: err.message });
  }
};

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
    } = req.body;

    if (!title || !subject) {
      return res.status(400).json({
        message: "Missing required fields (title, subject)."
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

    const newQuestionBank = new questionBankModel ({
      title,
      description,
      subject,
      chapterName,
      topic,
      level,
      parentId: parentId ?? null,
      levels,
      createdBy : "admin",
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

exports.getQuestionBanksAndQuestions = async (req, res) => {
  try {
    const { parentId, searchText,  resource, negativeMarking, difficulty } = req.query;

    let questionBanks = [];
    let questions = [];

    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ message: "Invalid parentId format." });
      }
      questionBanks = await questionBankModel.find({ parentId }).populate('parentId').populate('createdBy').populate("subject","subject").populate("chapterName","chapterName").populate("topic","topic");
    } else {
      questionBanks = await questionBankModel.find({ parentId: null, levels: 0 }).populate('parentId').populate('createdBy').populate("subject","subject").populate("chapterName","chapterName").populate("topic","topic");
    }

    const questionBankIds = questionBanks.map(bank => bank._id);

    if (parentId) {
      let questionQuery = { questionBankParentId: parentId };
      //  questionQuery.createdBy = "admin";
      // if (previousYears) questionQuery.previousYearsQuestion = previousYears;
      if (resource) questionQuery.resource = resource;
      if (negativeMarking) questionQuery.negativeMarking = negativeMarking;
      if (difficulty) questionQuery.difficultyLevel = difficulty;

      if (searchText) {
        questionQuery.questionText = { $regex: searchText, $options: 'i' };
      }
      questions = await questionModel.find(questionQuery).select('number type difficultyLevel resource previousYearsQuestion topic chapterName subject numberOfQuestionImport class course').populate("subject","subject").populate("chapterName","chapterName").populate("topic","topic").populate("class","class").populate("course","course");
    } else {
      let questionQuery = { questionBankParentId: { $in: questionBankIds } };
      // questionQuery.createdBy = "admin";
      if (searchText) {
        questionQuery.questionText = { $regex: searchText, $options: 'i' };
      }

      questions = await questionModel.find(questionQuery).select('number type difficultyLevel resource previousYearsQuestion topic chapterName subject class course numberOfQuestionImport').populate("subject","subject").populate("chapterName","chapterName").populate("topic","topic").populate("class","class").populate("course","course");
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


exports.createQuestions = async (req, res) => {
  try {
    const {
      questions,
      questionBankParentId,
      createdBy,
    } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "Questions must be a non-empty array." });
    }

    const questionBank = await questionBankModel.findById(questionBankParentId);
    // if (!questionBank) {
    //   return res.status(404).json({ message: "Question bank not found." });
    // }

    const existingCount = await questionModel.countDocuments();

    const preparedQuestions = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const {
        correctAnswer,
        blanks,
        passage,
        subQuestions,
        answerType,
        difficultyLevel,
        marks,
        negativeMarking,
        negativeMarksValue,
        options,
        previousYearsQuestion,
        questionText,
        questionUrl,
        resource,
        solution,
        titles,
        type,
        year
      } = question;

      if (!type || !questionText || !marks || !difficultyLevel) {
        return res.status(400).json({
          message: `Question ${i + 1}: Missing required fields (type, questionText, marks, difficultyLevel).`
        });
      }

      // Type-specific validation
      switch (type) {
        case "mcq":
          if (!answerType) {
            return res.status(400).json({ message: `Question ${i + 1}: MCQ must have answerType.` });
          }
          if (!Array.isArray(options) || options.length !== 4) {
            return res.status(400).json({ message: `Question ${i + 1}: MCQ must have exactly 4 options.` });
          }
          if (!options.some(opt => opt.isCorrect === true)) {
            return res.status(400).json({ message: `Question ${i + 1}: At least one MCQ option must be correct.` });
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
            if (!blank.correctAnswer) {
              return res.status(400).json({ message: `Question ${i + 1}: Each blank must have correctAnswer.` });
            }
          }
          break;

        case "integerType":
          if (correctAnswer === undefined || typeof correctAnswer !== "number") {
            return res.status(400).json({ message: `Question ${i + 1}: Integer must have a numeric correctAnswer.` });
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
              return res.status(400).json({ message: `Question ${i + 1}, Sub-question ${j + 1}: Missing type or text.` });
            }
            if (subQ.type === "mcq" && (!Array.isArray(subQ.options) || subQ.options.length !== 4)) {
              return res.status(400).json({ message: `Question ${i + 1}, Sub-question ${j + 1}: MCQ must have 4 options.` });
            }
          }
          break;

        default:
          return res.status(400).json({ message: `Question ${i + 1}: Invalid question type '${type}'.` });
      }

      // Prepare new question with inherited values
      preparedQuestions.push({
  ...question,
  questionBankParentId,
  createdBy,
  subject: question.subject,
  chapterName: question.chapterName,
  topic: question.topic,
  number: existingCount + i + 1,
});

    }

    const insertedQuestions = await questionModel.insertMany(preparedQuestions);
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
