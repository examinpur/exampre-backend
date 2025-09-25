const mongoose = require("mongoose");

const schemaFiles = mongoose.Schema({
     name: {
        type : String,
        required : true,
     },
    type:{
        type : String,
        required : true,
     } ,
    date: {
        type : String,
        required : true,
     },
     level : {
        type : Number,
        default:0
     },
     parentId:{
           type : mongoose.Schema.Types.ObjectId,
           ref : "myLibraryFolder"
          },
     duration: {
        type : String,
        required : true
     },
     icComplete:{
      type : Boolean,
      default : false,
     },
     
     tag: [{
        type :String,
     }],
     preview: {
        type : Number,
        default : 0,
     },
     sections: [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "myLibrarySections",
     }]
},
{
    timestamp : true
})

const fileModel = mongoose.model("myLibraryFiles" , schemaFiles)

module.exports = {fileModel};