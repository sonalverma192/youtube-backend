const mongoose = require('mongoose')

const videoSchema = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId , ref : "user", require : true, index : true},
    title:{type:String,required:true,trim:true},
    discription:{type:String,required:true,trim:true},
    tags:{type:String,required:true},
    category:{type:String,require:true},
    thumbnailUrl:{type:String,required:true},
    thumbnailId:{type:String,required:true},
    videoId:{type:String,required:true},
    videoUrl:{type:String,required:true},
    view:{type:Number,default:0},
    uploadedBy:{type : mongoose.Schema.Types.ObjectId , ref : "user"},
    likedBy:[{type : mongoose.Schema.Types.ObjectId , ref : "user"}],
    dislikedBy:[{type : mongoose.Schema.Types.ObjectId , ref : "user"}],
    likeCount:{type:Number,default:0},
    dislikeCount:{type:Number,default:0},
    
},{timestamps:true}
)

module.exports = mongoose.model("video",videoSchema)