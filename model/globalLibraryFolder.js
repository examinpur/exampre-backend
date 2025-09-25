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
      ref : "GlobalLibraryFolder"
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

const globalFolderModel = mongoose.model("GlobalLibraryFolder" , schemaFolder)

module.exports = {globalFolderModel};