const express =require('express')
const route = express.Router()
const {commentPost,
    getAllCommentByVideoId,
    editComment,
    deleteComment,
    likeComment,
    dislikeComment
} = require('../controller/commentController')


route.post('/comment/:videoId',commentPost)
route.get('/:videoId',getAllCommentByVideoId)
route.put('/editComment/:commentId',editComment)
route.delete('/deleteComment/:commentId',deleteComment)
route.put('/like/:commentId',likeComment)
route.put('/dislike/:commentId',dislikeComment)



module.exports = route;