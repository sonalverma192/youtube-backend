const express = require('express')
const route = express.Router()
const {login,
    signup,
    subscriber,
    unsubscribe,
    ProfilePicUpdate,
    coverPicUpdate,
    channelInfo,
    updateChannelDetails,
    logout
} = require('../controller/userController')


route.post('/signup',signup)
route.post('/login',login)
route.put('/subscribe/:channelId',subscriber)
route.put('/unsubscribe/:channelId',unsubscribe)
route.put('/profilePic',ProfilePicUpdate)
route.put('/coverPic',coverPicUpdate)
route.get('/channelInfo/:channelId',channelInfo)
route.put('/updateChannelDetail/:channelId',updateChannelDetails)
route.delete('/logout/:channelId',logout)



module.exports = route;