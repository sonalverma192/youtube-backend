require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')

const connectDB = async(req,res)=>{
    try
    {
        await mongoose.connect(process.env.MONGODATABASE_URL)
        console.log('DataBase connected ')
    }
    catch(err)
    {
        console.log(err)
        console.log('Failed to connect DB')
    }
}

module.exports = connectDB;