const express =require('express')
const route = express.Router()
const {commentPost,
    getAllCommentByVideoId,
    editComment,
    deleteComment,
    likeComment
} = require('../controller/commentController')


route.post('/comment/:videoId',commentPost)
route.get('/:videoId',getAllCommentByVideoId)
route.put('/editComment/:commentId',editComment)
route.delete('/deleteComment/:commentId',deleteComment)
route.post('/like/:commentId',likeComment)



module.exports = route;