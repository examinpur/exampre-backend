const express = require("express");
const { createChapter, getAllChapters, getChapterById, updateChapter, deleteChapter, getChaptersBySubjectId } = require("../controller/chapterName.controller");
const chapterRouter = express.Router();

chapterRouter.post("/",  createChapter);
chapterRouter.get("/",  getAllChapters );
chapterRouter.get("/:id",  getChapterById );
chapterRouter.patch("/:id",  updateChapter );
chapterRouter.delete("/:id", deleteChapter);
chapterRouter.get("/subject/:subjectId",  getChaptersBySubjectId);

module.exports = chapterRouter;
