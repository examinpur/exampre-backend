const mongoose = require("mongoose");

const schemaFolder = mongoose.Schema({
     name: {
        type : String,
        required : true,
     },
    type:{
        type : String,
        required : true,
        enum : ["file","folder"]
     } ,
     parentId:{
      type : mongoose.Schema.Types.ObjectId,
      ref : "myLibraryFolder"
     },
    date: {
        type : String,
        required : true,
     },
     level : {
        type : Number,
        default:0
     },
     children : [],
},
{
    timestamp : true
})

const folderModel = mongoose.model("myLibraryFolder" , schemaFolder)

module.exports = {folderModel};