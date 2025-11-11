const passportLocalMongoose = require('passport-local-mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // allows multiple docs with null googleId
    },
    isUsernameSet: {
        type: Boolean,
        default: true // local signups already set username
    },
    profilePhoto: {
        type: String,
        default: null
    }
});

UserSchema.plugin(passportLocalMongoose,{
    usernameField: 'username'
}); // adds username, hash and salt fields

const User = mongoose.model('User', UserSchema);
module.exports = User; 