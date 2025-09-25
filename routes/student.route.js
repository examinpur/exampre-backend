const express = require("express");
const router = express.Router();
const studentController = require("../controller/student.controller");

router.post('/register', studentController.createStudent );
router.post('/login', studentController.login);

export default router;
