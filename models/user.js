const passportLocalMongoose = require('passport-local-mongoose');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    },
});

UserSchema.plugin(passportLocalMongoose); // adds username, hash and salt fields

const User = mongoose.model('User', UserSchema);
module.exports = User; 