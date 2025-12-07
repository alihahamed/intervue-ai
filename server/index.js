const express = require('express')
const multer = require('multer')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(cors())
app.use(express.json())

const port = 3021

const storage = multer.diskStorage({
    destination:function (req, file, cb) {
        cb(null, 'uploads/') // the folder where the audio files are saved
    },
    filename: function (req, file, cb) {
        // We add Date.now() to the name to prevent files overwriting each other
        // e.g., "audio-123456789.wav"
        cb(null, 'audio-' + Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({storage:storage})

app.post('/upload-audio', upload.single('audio'), (req, res) => { // upload.single('audio') looks for a file name with 'audio'
    if(!req.file) {
        res.status(400).json({message:"Error while recieving the file"})
    }

    console.log("Audio recieved, check the uploads folder for the file")
    console.log("saved at:" , req.file.path)

    return res.json({
        message:"File uploaded succesfully",
        success:true,
        filePath:req.file.path
    })

   
})

 app.listen(port, () => {
        console.log("Server started listening on port 3021")
    })