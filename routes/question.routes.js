
const express = require('express');
const { createQuestions, editQuestion, deleteQuestion, getQuestionById, getAllQuestions, uploadQuestionsWithDoc, getShuffledQuestions, resetQuestionImportCount } = require('../controller/question.controller');
const { authenticate } = require('../middleware/authMiddleware');
const questionsRoutes = express.Router();
const multer = require("multer");
// const { resetQuestionImportCount } = require('../controller/library.controller');
const upload = multer({ dest: 'uploads/' });

questionsRoutes.post('/', createQuestions);
questionsRoutes.patch('/:id', editQuestion);
questionsRoutes.get('/:id', getQuestionById);
questionsRoutes.delete('/:id', deleteQuestion);
questionsRoutes.get('/',authenticate, getAllQuestions);
questionsRoutes.post("/doc/:sectionId",upload.single('docfile'),authenticate, uploadQuestionsWithDoc)
questionsRoutes.post("/add-questions", getShuffledQuestions);
questionsRoutes.patch("/reset-import-count/:questionIds",authenticate , resetQuestionImportCount)

module.exports = questionsRoutes;




