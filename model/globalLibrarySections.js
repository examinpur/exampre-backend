const mongoose = require("mongoose");

const schemaSection = mongoose.Schema({
     name: {
        type : String,
        required : true,
     },
  instructions: {
    type : String
  },
  parentId : {
  type : String,
  required : true
  },
  maxSectionMarks : {
    type : Number,
    required : true,
  },
  questions: []
},
{
    timestamp : true
})

const GlobalSectionModel = mongoose.model("GlobalLibrarySections" , schemaSection)

module.exports = {GlobalSectionModel};