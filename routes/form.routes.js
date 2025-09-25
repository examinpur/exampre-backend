const express = require("express");
const CourseModel = require("../model/course");
const Class = require("../model/class");
const Subject = require("../model/subject");
const FormRouter = express.Router();

FormRouter.get("/", async(req, res) => {
    try {
        const courses = await CourseModel.find({isDelete : false}).select("course");
        const classs = await Class.find().select("class");
        const subject = await Subject.find().select("subject");

        return res.status(200).json({data : {courses, classs, subject}});
    } catch (error) {
        res.status(500).json({message : "Internal server error.", error : error.message})
    }
})


module.exports = FormRouter;
