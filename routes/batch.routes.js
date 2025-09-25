
const express = require('express');
const { createbatch, getAllbatchs, getbatchById, updatebatch, deletebatch, onlyTitleOfBatchs , removeStudentFromBatch , removeArrayOfStudentFromBatch, addTestsToBatch} = require('../controller/batch.controller');
const { authenticate } = require('../middleware/authMiddleware');
const batchRoutes = express.Router();

batchRoutes.post('/',authenticate , createbatch);
batchRoutes.get('/', getAllbatchs);
batchRoutes.get("/title",onlyTitleOfBatchs);
batchRoutes.get('/:id', getbatchById);
batchRoutes.patch('/:id', updatebatch);
batchRoutes.patch('/add-tests/:batchId', addTestsToBatch);
batchRoutes.delete('/:id', deletebatch);
batchRoutes.delete('/:id/student/:studentId', removeStudentFromBatch);
batchRoutes.delete('/:id/students', removeArrayOfStudentFromBatch);




module.exports = batchRoutes;
