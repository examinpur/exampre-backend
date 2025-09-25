const express = require("express");
const { createFolder , createFile , createQuestions , createSection,importQuestionsInSection , editFile , editFolder ,editQuestion , editSection , deleteFile , deleteFolder , deleteQuestion , deleteSection , getRootOrChildItems, getSectionsWithQuestionsByFileId , getSectionsWithQuestionsByParentId, getQuestionsBySectionId, getSectionsByFileId, getSectionsWithQuestionsByParentIds, getAllData, getAllDataAdmin } = require("../controller/globalLibrary.controller");
const { authenticate } = require("../middleware/authMiddleware");
const GloballibraryRoutes = express.Router();


GloballibraryRoutes.post("/add-new-folder" , createFolder );
GloballibraryRoutes.post("/add-new-file" , createFile);
GloballibraryRoutes.post("/add-new-section" ,createSection );
GloballibraryRoutes.post("/add-new-question" , createQuestions);


GloballibraryRoutes.patch("/sections/:sectionId", editSection);
GloballibraryRoutes.patch("/questions/:questionId", editQuestion);
GloballibraryRoutes.patch("/folders/:folderId", editFolder);
GloballibraryRoutes.patch("/files/:fileId", editFile);
GloballibraryRoutes.patch('/import/:sectionId',importQuestionsInSection)

GloballibraryRoutes.delete("/questions/:questionId", deleteQuestion);
GloballibraryRoutes.delete("/sections/:sectionId", deleteSection);
GloballibraryRoutes.delete("/folders/:folderId", deleteFolder);
GloballibraryRoutes.delete("/files/:fileId", deleteFile);

GloballibraryRoutes.get("/get-all-data", getRootOrChildItems);
GloballibraryRoutes.get("/get-sections/:sectionId" , getSectionsWithQuestionsByParentId)
GloballibraryRoutes.get('/sections-with-questions/:fileId', getSectionsWithQuestionsByFileId);
GloballibraryRoutes.get('/questions/:sectionId', getQuestionsBySectionId);
GloballibraryRoutes.get("/get-sections-by-fileid/:fileId", getSectionsByFileId);
GloballibraryRoutes.get("/get-section/:sectionId", getSectionsWithQuestionsByParentIds);
GloballibraryRoutes.get("/",authenticate, getAllData);
GloballibraryRoutes.get("/get-all-test-admin", getAllDataAdmin);


module.exports = { GloballibraryRoutes }