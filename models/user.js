const mongoose = require('mongoose');



const schema = new mongoose.Schema({
    firstname:{
        required:true,
        type:String
    },
    lastname:{
        required:true,
        type:String 
    },
    email:{
        required:true,
        type:String,
    },
    phone:{
    required:true,
    type:String,
    length:10
    },
    password:{
        required:true,
        type:String,
        length:40
    },
    token:String
    
})

const User = mongoose.model('User',schema)

module.exports = User;