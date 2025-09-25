const express = require("express");
const { createSubject, getAllSubjects, getSubjectById, updateSubject, deleteSubject,getAllSubjectsByClassId } = require("../controller/subject.controller");
const subjectRouter = express.Router();

subjectRouter.post("/",  createSubject);
subjectRouter.get("/",  getAllSubjects );
subjectRouter.get("/class/:classId",  getAllSubjectsByClassId );
subjectRouter.get("/:id",  getSubjectById);
subjectRouter.patch("/:id",  updateSubject);
subjectRouter.delete("/:id",  deleteSubject);

module.exports = subjectRouter;
