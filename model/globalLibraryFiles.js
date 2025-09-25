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
           ref : "GlobalLibraryFolder"
          },
     duration: {
        type : String,
        required : true
     },
     tag: [{
        type : mongoose.Schema.Types.ObjectId,
           ref : "Batch"
     }],
     preview: {
        type : Number,
     },
     sections: [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "GlobalLibrarySections",
     }]
},
{
    timestamp : true
})

const globalFileModel = mongoose.model("GlobalLibraryFiles" , schemaFiles)

module.exports = {globalFileModel};