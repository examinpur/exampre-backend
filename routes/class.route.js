const express = require("express");
const { createClass, getAllClasses, getClassById, updateClass, deleteClass } = require("../controller/class.controller");
const classRouter = express.Router();

classRouter.post("/",  createClass );
classRouter.get("/", getAllClasses );
classRouter.get("/:id",  getClassById);
classRouter.patch("/:id",  updateClass);
classRouter.delete("/:id", deleteClass);

module.exports = classRouter;
