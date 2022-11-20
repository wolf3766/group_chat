const mongoose =require('mongoose');

const MessageSchema=mongoose.Schema({
    users:Array,
    sender:{
        type:String,
        required:true,
    },message:{
        type:String,
        required:true
    },roomID:{
        type:String,
        required:true
    }
})

module.exports=mongoose.model("Messages",MessageSchema);