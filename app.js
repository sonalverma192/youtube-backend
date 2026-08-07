const express = require('express');
const app = express();
const connectDB = require('./configue/db')
const bodyParser = require('body-parser')
const userRoute = require('./routes/user')
const videoRoute = require('./routes/video')
const commentRoute = require('./routes/comment')
const fileUpload = require('express-fileupload')
const cors = require("cors");

connectDB()

app.use(
  cors({
    origin: "http://localhost:3000", 
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: './tmp/'
}
))

app.use('/user', userRoute)
app.use('/video',videoRoute)
app.use('/comment',commentRoute)


module.exports = app;