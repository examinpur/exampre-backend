
const express = require('express');
const { createOrUpdateSolution, DeleteSolutionBysolutionId } = require('../controller/solution.controller');
const solutionRouter = express.Router();

solutionRouter.post('/create-or-update', createOrUpdateSolution);
solutionRouter.delete('/delete/:solutionId', DeleteSolutionBysolutionId);

module.exports = solutionRouter;
