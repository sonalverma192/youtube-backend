const express = require('express')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    channelName:{type:String , require:true},
    email:{type:String , required:true, unique:true},
    password:{type:String, required:true , minlength:6},
    coverPicUrl:{type:String,default:""},
    coverPicId:{type:String,default:""},
    description:{type:String, require:true},
    profilePicUrl:{type:String,default:""},
    profilePicId:{type:String,default:""},
    subscribers:[{type:mongoose.Types.ObjectId , ref:"User"}],
    subscribedTo:[{type:mongoose.Types.ObjectId , ref:"User"}]
},
{timestamps:true}
)

module.exports = mongoose.model("user",userSchema)