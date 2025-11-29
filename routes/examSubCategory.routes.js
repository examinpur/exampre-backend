const express = require("express");
const { createSubCategory, getAllSubCategories, getexamSubCategoryById, updateSubCategory, deleteSubCategory } = require("../controller/examSubCategory.controller");
const examSubCategoryRouter = express.Router();

examSubCategoryRouter.post("/",  createSubCategory );
examSubCategoryRouter.get("/", getAllSubCategories );
examSubCategoryRouter.get("/:id",  getexamSubCategoryById);
examSubCategoryRouter.patch("/:id",  updateSubCategory);
examSubCategoryRouter.delete("/:id", deleteSubCategory);

module.exports = examSubCategoryRouter;
