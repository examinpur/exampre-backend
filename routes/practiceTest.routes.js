
const express = require('express');
const { createPracticeTest, getAllListOfTest, getAllListOfWithSections, getAllPracticeTest, getPracticeTestById, updatePracticeTest, deletePracticeTest, downloadPracticeTestDocx } = require('../controller/practiceTest.controller');
const practiceTestRoutes = express.Router();

practiceTestRoutes.post('/', createPracticeTest);
practiceTestRoutes.get("/all-tests",getAllListOfTest);
practiceTestRoutes.get("/test-sections", getAllListOfWithSections)
practiceTestRoutes.get('/', getAllPracticeTest);
practiceTestRoutes.get('/:id', getPracticeTestById);
practiceTestRoutes.put('/:id', updatePracticeTest);
practiceTestRoutes.delete('/:id', deletePracticeTest);
practiceTestRoutes.post('/downloaddocx', downloadPracticeTestDocx);


module.exports = practiceTestRoutes;
