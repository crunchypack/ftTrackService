const mongoose = require("mongoose");
const Schema = mongoose.Schema;


var logSchema = new Schema({
    user: {
        type:String,
        required:true
    },
    items:[{type:Number}],
    date: {type:Date, required:true}
});

module.exports = mongoose.model('logs', logSchema);