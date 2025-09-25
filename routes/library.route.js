const express = require("express");
const { createFolder, createFile, createSection, createQuestions, editSection, deleteSection, editQuestion, deleteQuestion, editFolder, deleteFolder, editFile, deleteFile, getRootOrChildItems, getSectionsWithQuestionsByParentId, getSectionsWithQuestionsByFileId, getSectionsByFileId, updatePreviewType, importQuestionsInSection, getAllTests, resetAllQuestionImportCounts, getGlobalTests } = require("../controller/library.controller");
const { authenticate } = require("../middleware/authMiddleware");
const libraryRoutes = express.Router();

// Post
libraryRoutes.post("/add-new-folder" , createFolder );
libraryRoutes.post("/add-new-file" , createFile);
libraryRoutes.post("/add-new-section" ,createSection );
libraryRoutes.post("/add-new-question" ,authenticate , createQuestions);
// Patch
libraryRoutes.patch("/sections/:sectionId", editSection);
libraryRoutes.patch("/questions/:questionId",authenticate, editQuestion);
libraryRoutes.patch("/folders/:parentId/:folderId", editFolder);
libraryRoutes.patch("/files/:parentId/:fileId", editFile);
libraryRoutes.patch("/update-test-preview/:testId", updatePreviewType);
libraryRoutes.patch('/import/:sectionId',importQuestionsInSection)
libraryRoutes.patch("/reset",authenticate ,resetAllQuestionImportCounts)
// Delete
libraryRoutes.delete("/sections/:sectionId", deleteSection);
libraryRoutes.delete("/delete-folder/:folderId" , deleteFolder);
libraryRoutes.delete("/folders/:parentId/:folderId", deleteFolder);
libraryRoutes.delete("/questions/:questionId/:sectionId", deleteQuestion);
libraryRoutes.delete("/files/:parentId/:fileId", deleteFile);

// Get
libraryRoutes.get("/get-all-data", getRootOrChildItems);
libraryRoutes.get("/get-sections/:sectionId" , getSectionsWithQuestionsByParentId)
libraryRoutes.get('/sections-with-questions/:fileId', getSectionsWithQuestionsByFileId);
libraryRoutes.get("/get-sections-by-fileid/:fileId", getSectionsByFileId);
libraryRoutes.get("/get-all-test", getAllTests);
libraryRoutes.get("/get-global-test", getGlobalTests);


module.exports = { libraryRoutes }