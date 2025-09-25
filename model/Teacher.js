const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    role : {
      type :String,
      enum : ["student" , "teacher"],
      required : true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    verified : {
        type : Boolean,
        default : false
    },
    verificationToken : {
      type : String,
    },
    isDeleted : {
        type : Boolean,
        default : false
    },
    resetToken : {
      type : String,
    },
    subjects: [
      {
        type: String,
        enum: ['physics', 'chemistry', 'mathematics', 'biology', 'english', 'social-study'],
      }
    ],
    examGoals : [{
      type : String,
    }],
    teachingSubjects : [{
      type : String,
    }],
    teachingExperience :{
      type:String
    },
    notifications : { 
      type : Boolean,
      default : false
    },
    tourCompleted : {
      type : Boolean,
      default : false
    }
  },
  { timestamps: true }
);

const teacherModel = mongoose.model('Teacher', teacherSchema);
module.exports = {teacherModel}
