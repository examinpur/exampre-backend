const express = require("express");
const { createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse } = require("../controller/course.controller");
const courseRouter = express.Router();

courseRouter.post("/",  createCourse);
courseRouter.get("/",  getAllCourses );
courseRouter.get("/:id",  getCourseById);
courseRouter.patch("/:id",  updateCourse);
courseRouter.delete("/:id",  deleteCourse);

module.exports = courseRouter;
