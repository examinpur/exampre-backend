const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email:     { type: String, required: true, unique: true, lowercase: true },
    password:  { type: String, },
    verified:  { type: Boolean, default: false },
    verificationToken: { type: String },
    isDeleted: { type: Boolean, default: false },
    resetToken: { type: String },
    examType: {
      type: String,
      enum: ['jee-mains', 'board-exam', 'neet', 'other'],
    },

    enrollType: {
      type: String,
      default: 'free',
      enum: ['free', 'paid'],
    },
    payment: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const studentModel = mongoose.model('Student', studentSchema);

module.exports = {studentModel}