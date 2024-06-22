const mongoose = require("mongoose");



const screenSchema = new mongoose.Schema({
    screenID:{
        type:String,
        required:true,
        unique: true

    },
    data:{
        type:String,
        default: '[]' // Initialize with an empty JSON array
    }
});


const ScreenModel = mongoose.model('Screens',screenSchema)

module.exports = ScreenModel;