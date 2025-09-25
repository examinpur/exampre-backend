const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  id: { type: String }, 
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const blankSchema = new mongoose.Schema({
  correctAnswer: { type: String, required: true }
});

const subQuestionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq', 'truefalse', 'fillintheblank', 'integerType'],
    required: true,
  },
  questionText: { type: String, required: true },
  options: [optionSchema], 
  answerType: {
    type: String,
    enum: ['single', 'multiple'],
  },
  blanks: [blankSchema], 
  correctAnswer: { type: mongoose.Schema.Types.Mixed },
});

const questionSchema = new mongoose.Schema({
  sectionId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'myLibrarySections',
    }
  ],
  type: {
    type: String,
    enum: ['mcq', 'truefalse', 'fillintheblank', 'integerType', 'comprehension'],
    required: true,
  },
  createdBy: {
          type: mongoose.Schema.Types.Mixed,
          required: true,
        },
        subject: {
        type: String,
        // enum: ['physics', 'chemistry', 'mathematics', 'biology'],
        default : ""
    },
    year:{
      type : String,
    },
    titles:[{
      type:String
    }],
    chapterName: {
      type: String,
    },
    topic: {
      type: String,
    },
    previousYearsQuestion: {
      type: Boolean,
      default: false,
    },
    resource: {
      type: String,
      default: '',
    },
    number : {
      type : Number,
      required : true,
    },
  questionText: { type: String, required: true },
  marks: { type: Number, required: true },
  negativeMarking: { type: Boolean, default: false },
  negativeMarksValue: { type: Number, default: 0 },
  difficultyLevel: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  
  options: [optionSchema],
  answerType: {
    type: String,
    enum: ['single', 'multiple'],
  },
  blanks: [blankSchema],  
  solution: { type: String },
  correctAnswer: { type: mongoose.Schema.Types.Mixed },
  
  passage: { type: String }, 
  subQuestions: [subQuestionSchema], 
}, { 
  timestamps: true 
});

const myLibraryQuestionsModel = mongoose.model('myLibraryQuestions', questionSchema);

module.exports = { myLibraryQuestionsModel };

