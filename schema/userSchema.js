const mongoose =  require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type: String
    },
    email:{
        type: String
    },
    desg:{
        type: String
    },
    uid:{
        type: String
    },
    upass:{
        type: String
    },
    phone:{
        type: String
    },
    token:{
        type: String
    }
})

const User = mongoose.model("users", userSchema);

module.exports = User;