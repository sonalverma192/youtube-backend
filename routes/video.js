const express = require('express')
const router = express.Router()
const {upload,
    like,
    dislike,
    videoById,
    deleteVideo,
    updateVideo,
    videoByChannelId,
    AllVideos
} = require('../controller/videoController')


router.post('/videoUpload',upload)
router.post('/like/:videoId',like)
router.post('/dislike/:videoId',dislike)
router.get('/videoById/:videoId',videoById)
router.delete('/deleteVideo/:videoId',deleteVideo)
router.put('/updateVideo/:videoId',updateVideo)
router.get('/getAllVideo/:channelId',videoByChannelId)
router.get('/AllVideos',AllVideos)



module.exports = router