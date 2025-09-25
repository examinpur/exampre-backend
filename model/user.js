const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    name : {
    type : String,
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
    educationLevel : {
        type : String,
    },
    shift:{
        type : String
    },
    learningStyle : {
        type : String,
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

const userModel = mongoose.model('users', userSchema);
module.exports = {userModel}
