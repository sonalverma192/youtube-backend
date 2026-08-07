const Comment = require('../model/Comment')
const User = require('../model/User')
const Video = require('../model/Video')
const jwt = require('jsonwebtoken')

const commentPost = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)

        const video = await Video.findById(req.params.videoId)
        if (!video) {
            return res.status(500).json({
                msg: 'video not found'
            })
        }

        const newComment = new Comment({
            commentText: req.body.commentText,
            commentBy: tokenData.userId,
            videoId: req.params.videoId
        })

        await newComment.save();
        res.status(200).json({
            comment : newComment,
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

const getAllCommentByVideoId = async (req, res) => {
    try {
        const video = await Video.findById(req.params.videoId)
        if (!video) {
            return res.status(500).json({
                msg: 'Video not found'
            })
        }

        const comments = await Comment.find({videoId:req.params.videoId}).populate("commentBy")
        res.status(200).json({
        comment: comments
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

const editComment = async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)

        const user = await Comment.findById(tokenData.userId)
        const commentUser = await Comment.findById(req.params.commentId)

        if(tokenData.userId == commentUser.commentBy)
        {
           commentUser.commentText = req.body.commentText
           await commentUser.save()
           res.status(200).json({
            msg:'comment updated',
            comment:commentUser
           })
        }

        res.status(500).json({
            msg:'You have no right to edit the comment'
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
}

const deleteComment = async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)

        const comment = await Comment.findById(req.params.commentId)
        const video = await Video.findById(comment.videoId)

        if(tokenData.userId == comment.commentBy || tokenData.userId == video.userId)
        {
            const comment = await Comment.findByIdAndDelete(req.params.commentId)
            res.status(200).json({
                msg:"comment deleted"
            })
        }

        res.status(500).json({
            msg:'you dont have access to delete thw comment'
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error : err
        })
    }
}

const likeComment = async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)
        const comment = await Comment.findById(req.params.commentId)

        if (comment.likedBy.some(id => id.toString() === tokenData.userId)) {
            comment.like -= 1
            comment.likedBy = comment.likedBy.filter(
                id => id.toString() !== tokenData.userId
            );
            await comment.save();
            return res.status(200).json({
                comment
            });
        }
        comment.like += 1
        comment.likedBy.push(tokenData.userId);
        await comment.save();
        res.status(200).json({
            comment
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error : err
        })
    }
}


module.exports = { commentPost, getAllCommentByVideoId, editComment, deleteComment, likeComment }