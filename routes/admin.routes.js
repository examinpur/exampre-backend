const express = require("express");
const { createNewAdmin, loginAdmin, createbatch, getAllbatchs, getbatchById, getQuestionBanksAndQuestions, createQuestionBank, createQuestions } = require("../controller/admin.controller");
const adminRoutes = express.Router();


adminRoutes.post("/register" , createNewAdmin);
adminRoutes.post('/login', loginAdmin);
adminRoutes.post('/batch' , createbatch);
adminRoutes.get("/batch",getAllbatchs)
adminRoutes.get('/batch/:id', getbatchById);
adminRoutes.post('/question-bank', createQuestionBank);
adminRoutes.get('/question-bank', getQuestionBanksAndQuestions);
adminRoutes.post('/questions', createQuestions);

module.exports = { adminRoutes }