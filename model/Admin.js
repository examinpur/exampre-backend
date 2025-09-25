const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
    isDeleted : {
        type : Boolean,
        default : false,
    }
  },
  { timestamps: true }
);

const adminModel = mongoose.model('Admin', adminSchema);

module.exports = {adminModel}