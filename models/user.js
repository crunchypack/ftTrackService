const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const SALTY = 10;

var user = new Schema({
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true
    },
    password:{
        type:String,
        required:true
    }
});
// Auth
user.statics.authenticate = function(email, password, callback){
    User.findOne({email:email}).exec((err,user)=>{
        if(err) return callback(err);
        else if(!user){
            var err = new Error("User not found!");
            err.status=401;
            return callback(err)
        }
        bcrypt.compare(password, user.password, (err, result) =>{
            if(result) return callback(null,user);
            else return callback(err);
        });
    });
};

// Hash password before saving in database
user.pre('save', function(next){
    let user = this;
    console.log(user.password);
    bcrypt.genSalt(SALTY, (err, salt)=>{
        if(err){
            console.log('SALT error: ' + err);
            return next(err);
        }
        bcrypt.hash(user.password, salt, (error, hash)=>{
            if(error){
                console.log("Error IN Hash: " + error );
                return next(error);
            }
            user.password = hash;
            next();
        });
    });
});

var User = mongoose.model('users', user);
module.exports = User;