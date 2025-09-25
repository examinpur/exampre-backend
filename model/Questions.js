const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  style: { type: String, default: "" }
});

const optionSchema = new mongoose.Schema({
  option_letter: { type: String, default: "" }, // not required
  text: { type: String, default: "" },          // not required
  isCorrect: { type: Boolean, default: false }, // not required
  optionUrl: {
    type: [imageSchema],
    default: []
  }
});

const blankSchema = new mongoose.Schema({
  correctAnswer: { type: String, default: "" } // not required
});

const subQuestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq', 'truefalse', 'fillintheblank', 'integerType'],
    default: 'mcq' // fallback
  },
  questionText: { type: String, default: "" },
  questionUrl: {
    type: [imageSchema],
    default: []
  },
  options: {
    type: [optionSchema],
    default: []
  },
  answerType: {
    type: String,
    enum: ['single', 'multiple'],
    default: 'single'
  },
  blanks: {
    type: [blankSchema],
    default: []
  },
  correctAnswer: { type: mongoose.Schema.Types.Mixed, default: null }
});

const questionSchema = new mongoose.Schema(
  {
    sectionId: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Section',
      default: []
    },
    type: {
      type: String,
      enum: ['mcq', 'truefalse', 'fillintheblank', 'integerType', 'comprehension'],
      default: 'mcq'
    },
    question_id: { type: String, default: "" }, // not required
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'classes',
      default: null
    },
    category: { type: String, default: "" },
    questionBankParentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bank',
      default: null
    },
    solution: { type: String, default: "" },
    solutionUrl: {
      type: [imageSchema],
      default: []
    },
    createdBy: { type: mongoose.Schema.Types.Mixed, default: "system" },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null
    },
    year: { type: String, default: "" },
    numberOfQuestionImport: {
      count: { type: Number, default: 0 },
      test: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Section',
        default: []
      }
    },
    titles: { type: [String], default: [] },
    chapterName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      default: null
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      default: null
    },
    previousYearsQuestion: { type: Boolean, default: false },
    resource: { type: String, default: "" },
    number: { type: Number, default: 0 },
    questionText: { type: String, default: "" },
    questionUrl: {
      type: [imageSchema],
      default: []
    },
    marks: { type: Number, default: 1 }, // fallback to 1 mark
    negativeMarking: { type: Boolean, default: false },
    negativeMarksValue: { type: Number, default: 0 },
     difficultyLevel: {
      type: String,
      default: 'easy'
    },
    options: {
      type: [optionSchema],
      default: []
    },
    answerType: {
      type: String,
      default: 'single'
    },
    blanks: {
      type: [blankSchema],
      default: []
    },
    correctAnswer: { type: mongoose.Schema.Types.Mixed, default: null },
    passage: { type: String, default: "" },
    subQuestions: {
      type: [subQuestionSchema],
      default: []
    }
  },
  { timestamps: true }
);

const questionModel = mongoose.model('Question', questionSchema);

module.exports = { questionModel };
