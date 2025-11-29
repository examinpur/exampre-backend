const express = require("express");
const { createExamTypes, getAllExamTypeses, getExamTypesById, updateExamTypes, deleteExamTypes } = require("../controller/examTypes.controller");
const examTypesRouter = express.Router();

examTypesRouter.post("/",  createExamTypes );
examTypesRouter.get("/", getAllExamTypeses );
examTypesRouter.get("/:id",  getExamTypesById);
examTypesRouter.patch("/:id",  updateExamTypes);
examTypesRouter.delete("/:id", deleteExamTypes);

module.exports = examTypesRouter;
