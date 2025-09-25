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

const sectionModel = mongoose.model("myLibrarySections" , schemaSection)

module.exports = {sectionModel};