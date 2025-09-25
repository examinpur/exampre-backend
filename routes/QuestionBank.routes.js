
const express = require('express');
const { createQuestionBank, getQuestionBanksAndQuestions, updateQuestionBank, deleteQuestionBank, getAllData, getAllFolders } = require('../controller/questionBank.controller');
const questionBankRoutes = express.Router();

questionBankRoutes.post('/', createQuestionBank);
questionBankRoutes.get('/', getQuestionBanksAndQuestions);
questionBankRoutes.patch('/:id', updateQuestionBank);
questionBankRoutes.delete('/:id', deleteQuestionBank);
questionBankRoutes.get("/get-all-data",getAllData);
questionBankRoutes.get("/folders",getAllFolders);
module.exports = questionBankRoutes;
