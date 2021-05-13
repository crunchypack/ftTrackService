const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var itemSchema = new Schema({
    name: {
        type:String,
        required:true,
        trim:true
    },
    brand:{
        type: String,
        required: true,
        trim: true
    },
    weight: [{type:String}],
    ean: {type:Number, required: true,unique:true},
    energy:
        {
            type: Number,
        }
    ,
    carbs:
        {
            type: Number,
        }
    ,
    sodium:
        {
            type: Number,
        }
    ,
    fat:
        {
            type: Number,
        }
    ,
    satfat:
        {
            type: Number,
        }
    ,
    salt:
        {
            type: Number,
        }
    ,
    sugar:
        {
            type: Number,
        }
    ,
    contains:[{type: String}],
    organic: Boolean,
    fairtrade: Boolean,
    eco: Boolean,
    vegetarian: Boolean,
    vegan: Boolean,
    healthnotes: String
});

module.exports = mongoose.model('items', itemSchema);