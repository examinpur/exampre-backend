const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  id: { type: String }, 
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true },
});

const blankSchema = new mongoose.Schema({
  id: { type: String, required: true },
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
      ref: 'Section',
      required: true,
    }
  ],
  type: {
    type: String,
    enum: ['mcq', 'truefalse', 'fillintheblank', 'integerType', 'comprehension'],
    required: true,
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
  
  correctAnswer: { type: mongoose.Schema.Types.Mixed },
  
  passage: { type: String }, 
  subQuestions: [subQuestionSchema], 
}, { 
  timestamps: true 
});

const globalQuestionModel = mongoose.model('GlobalLibraryQuestions', questionSchema);

module.exports = { globalQuestionModel };