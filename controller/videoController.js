require('dotenv').config()
const express = require('express')
const Video = require('../model/Video')
const User = require('../model/User')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const cloudinary = require('../configue/cloudinary')

const upload = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)

        const thumbnailUpload = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath, {
            resource_type: "image",
            folder: 'youtube/thumbnail'
        })

        console.log(req.files.video.tempFilePath);

        const videoUpload = await cloudinary.uploader.upload(req.files.video.tempFilePath, {
            resource_type: "video",
            folder: 'youtube/video'
        })

        console.log(req.files.video.tempFilePath);

        const newVideo = new Video({
            title: req.body.title,
            discription: req.body.discription,
            videoId: videoUpload.public_id,
            videoUrl: videoUpload.secure_url,
            thumbnailId: thumbnailUpload.public_id,
            thumbnailUrl: thumbnailUpload.secure_url,
            uploadedBy: tokenData.userId,
            tags: JSON.parse(req.body.tags),
            category: req.body.category
        })

        const result = await newVideo.save()
        res.status(200).json({
            msg: 'video uploaded',
            video: newVideo
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

const like = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)
        console.log(tokenData.userId)
        const video = await Video.findById(req.params.videoId)
        if (!video) {
            return res.status(500).json({
                msg: 'Video Not Found'
            })
        }

        if (video.likedBy.some(id => id.toString() === tokenData.userId)) {
            video.likeCount -= 1
            video.likedBy = video.likedBy.filter(userId => userId.toString() !== tokenData.userId)
            await video.save()
            return res.status(500).json({
                likeCount: video.likeCount,
                msg: video
            })
        }

        if (video.dislikedBy.some(id => id.toString() === tokenData.userId)) {
            video.dislikeCount -= 1
            video.dislikedBy = video.dislikedBy.filter(userId => userId.toString() !== tokenData.userId)

            video.likeCount += 1
            video.likedBy.push(tokenData.userId)

            await video.save()
            return res.status(500).json({
                likeCount: video.likeCount,
                msg: video
            })
        }

        video.likeCount += 1
        video.likedBy.push(tokenData.userId)

        await video.save()
        console.log(video.likedBy)
        return res.status(200).json({
            likeCount: video.likeCount,
            video: video
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

const dislike = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)

        const video = await Video.findById(req.params.videoId)
        if (!video) {
            return res.status(500).json({
                error: 'Video Not Found'
            })
        }

        if (video.dislikedBy.some(id => id.toString() === tokenData.userId)) {
            video.dislikeCount -= 1
            video.dislikedBy = video.dislikedBy.filter(userId => userId.toString() !== tokenData.userId)
            await video.save()
            return res.status(500).json({
                dislikeCount: video.dislikeCount,
                video: video
            })
        }

        if (video.likedBy.some(id => id.toString() === tokenData.userId)) {
            video.likeCount -= 1
            video.likedBy = video.likedBy.filter(userId => userId.toString() !== tokenData.userId)

            video.dislikeCount += 1
            video.dislikedBy.push(tokenData.userId)

            await video.save()
            return res.status(500).json({
                dislikeCount: video.dislikeCount,
                video: video
            })
        }


        video.dislikeCount += 1
        video.dislikedBy.push(tokenData.userId)
        await video.save()
        return res.status(200).json({
            dislikeCount: video.dislikeCount,
            video: video
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

const videoById = async (req, res) => {
    try {
        const videos = await Video.findById(req.params.videoId).populate('uploadedBy', '_id channelName profilePicUrl subscribers')

        if (!videos) {
            return res.status(500).json({
                error: 'Video Not Found'
            })
        }

        videos.view += 1
        await videos.save()
        res.status(200).json({
            msg: videos.view,
            video: videos
        })

    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

const updateVideo = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)

        const video = await Video.findById(req.params.videoId)

        video.title = req.body.title
        video.discription = req.body.discription
        video.tags = req.body.tags
        video.category = req.body.category
        if (req.body.thumbnail) {
            await cloudinary.uploader.destroy(video.thumbnailId)
            const thumbnailUpload = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath, {
                resource_type: "image",
                folder: 'youtube/thumbnail'
            })
            video.thumbnailId = thumbnailUpload.public_id,
            video.thumbnailUrl = thumbnailUpload.secure_url
        }

        await video.save()
        res.status(200).json({
            updateVideo : video
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

const deleteVideo = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)

        const videos = await Video.findById(req.params.videoId)
        if (tokenData.userId != videos.uploadedBy) {
            return res.status(500).json({
                msg: 'you have no access'
            })
        }

        await cloudinary.uploader.destroy(videos.thumbnailId)
        await cloudinary.uploader.destroy(videos.videoId, { resource_type: 'video' })
        const video = await Video.findByIdAndDelete(videos)
        res.status(200).json({
            msg: 'video deleted'
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}

// const videoByChannelId = async(req,res)=>{
//     try
//     {
//         const videos = await Video.find(req.params.ChannelId)
//         res.status(200).json({
//             videos
//         })
//     }
//     catch (err) {
//         console.log(err)
//         res.status(500).json(err)
//     }
// }

const AllVideos = async(req,res)=>{
    try
    {
        const videos = await Video.find().populate('uploadedBy','channelName profilePicUrl')
        res.status(200).json({
            videos
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json(err)
    }
}


module.exports = { upload, like, dislike, videoById, updateVideo ,deleteVideo, videoByChannelId, AllVideos}