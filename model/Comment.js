const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    commentText:{type:String, req:true},
    commentBy:{type:mongoose.Types.ObjectId,ref:'user'},
    videoId:{type:mongoose.Types.ObjectId,ref:'video'},
    like:{type:Number,default:0},
    dislike:{type:Number,default:0},
    likedBy:[{type:mongoose.Types.ObjectId,ref:'user'}],
    dislikeby:[{type:mongoose.Types.ObjectId,ref:'user'}],
},{timestamps:true}
)

module.exports = mongoose.model('comment',commentSchema)