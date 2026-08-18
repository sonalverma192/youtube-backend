require('dotenv').config()
const express=require('express')
const User = require('../model/User')
const bcrypt = require('bcrypt')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const cloudinary = require('../configue/cloudinary')

const signup = async (req, res) => {
    try 
    {
        const user = await User.find({email: req.body.email})
        if (user.length > 0) {
           return res.status(200).json({
                msg: 'Email already registerd'
            })
        }

        const hash = await bcrypt.hash(req.body.password, 10)

        const newUser = new User({
            channelName: req.body.channelName,
            email: req.body.email,
            password: hash,
            description: req.body.description,
        })

        const result = await newUser.save()

        res.status(200).json({
            newUser: result
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

const login = async (req, res) => {
    try 
    {
        const user = await User.find({ email: req.body.email })
        if (user.length == 0) {
            res.status(200).json({
                msg: 'Email not registered'
            })
        }

        const isMatch = await bcrypt.compare(req.body.password, user[0].password)
        if (!isMatch) {
            res.status(200).json({
                msg: 'Invalid Password'
            })
        }

        const appToken = await jwt.sign(
            { userId: user[0]._id, channelName: user[0].channelName, email: user[0].email, },
            process.env.SEC_KEY,
            { expiresIn: '365d' }
        )

        res.status(200).json({
            Token: appToken,
            channel:user
        })
    }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: 'Something is wrong'
        })
    }
}

const subscriber = async (req, res) => {
    try {
        const channel = await User.findById(req.params.channelId)
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)

         if(!channel)
        {
            return res.status(500).json({
                msg:'Channel not exist'
            })
        }

        if(channel._id == tokenData.userId)
        {
            return res.status(500).json({
                msg:"you can't subscribe yourself"
            })
        }

        const isSubscribed = await channel.subscribers.includes(tokenData.userId)
        if(isSubscribed)
        {
            return res.status(500).json({
                msg:"Already Subscribed"
            })
        }
        
        const user = await User.findById(tokenData.userId)

        channel.subscribers.push(tokenData.userId)
        user.subscribedTo.push(channel._id)

        await channel.save()
        await user.save()
        res.status(200).json({
            msg:'Subscribed'
        })

        }
    catch (err) {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
}

const unsubscribe = async(req,res)=>{
    try
    {
        const channel = await User.findById(req.params.channelId)
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)

        if(!channel)
        {
            return res.status(500).json({
                msg:'Channel not exist'
            })
        }

        if(channel._id == tokenData.userId)
        {
            return res.status(500).json({
                msg:"you can't unsubscribe yourself"
            })
        }
        const user = await User.findById(tokenData.userId)

        const isSubscribed = await channel.subscribers.includes(tokenData.userId)
        if(!isSubscribed)
        {
            return res.status(500).json({
                msg:"Not Subscribed"
            })
        }
       channel.subscribers = await channel.subscribers.filter(userId => userId != tokenData.userId)
        await channel.save()
        user.subscribedTo = await user.subscribedTo.filter(userId => userId != req.params.channelId)
        await user.save()

        res.status(200).json({
            msg:"Unsubscribed"
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

const ProfilePicUpdate = async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)
        console.log(tokenData)

        const user = await User.findById(tokenData.userId)
        if(user.profilePicId)
        {
            await cloudinary.uploader.destroy(user.profilePicId)
        }

        const profileUpload = await cloudinary.uploader.upload(req.files.profilePic.tempFilePath)
        user.profilePicId = profileUpload.public_id
        user.profilePicUrl = profileUpload.secure_url

        user.save()
        res.status(200).json({
            msg:'Profile Updated'
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

const coverPicUpdate = async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)
        console.log(tokenData)

        const user = await User.findById(tokenData.userId)
        if(user.coverPicIdPicId)
        {
            await cloudinary.uploader.destroy(user.coverPicId)
        }

        const coverPicUpload = await cloudinary.uploader.upload(req.files.coverPic.tempFilePath)
        user.coverPicId = coverPicUpload.public_id
        user.profilePicUrl = coverPicUpload.secure_url

        user.save()
        res.status(200).json({
            msg:'CoverPic Updated'
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

const channelInfo = async(req,res)=>{
    try
    {
        const channelInfo = await User.findById(req.params.channelId)
        res.status(200).json({
            channelInfo
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

const updateChannelDetails = async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)

        const user = await User.findById(req.params.channelId)
        
        if(req.body.password)
        {
          const hash = await bcrypt.hash(req.body.oldPassword,10)
          const isMatch = await bcrypt.compare(user.password , hash )
            if(isMatch)
            {
                const password = await bcrypt.hash(req.body.password,10)
                user.password = password
            }
        }
        user.channelName = req.body.channelName
        user.description = req.body.description
        

        await user.save()
        res.status(200).json({
            msg:"channelInfo Updated",
            user
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

const logout = async(req,res)=>{
    try
    {
        const token = req.headers.authorization.split(" ")[1]
        const tokenData = await jwt.verify(token, process.env.SEC_KEY)
        const channel = await User.findById(req.params.channelId)
        if(channel._id.toString() !== tokenData.userId)
        {
            return res.status(500).json({
                error : "You have no permission"
            })
        }
        
        const user = await User.deleteOne({_id : req.params.channelId})
        res.status(200).json({
            msg:"sucessfully deleted"
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

module.exports = {
    signup ,
    login ,
    subscriber ,
    unsubscribe ,
    ProfilePicUpdate ,
    coverPicUpdate,
    channelInfo,
    updateChannelDetails,
    logout
    }