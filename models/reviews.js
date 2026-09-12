const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReviewSchema = new Schema(
    {
        comment: String,
        ratings: {
            type : Number,
            min : 1,
            max : 5
        },
        createdAt: {
            type: Date,
            default : Date.now()
        }
    }
);

const reviews = mongoose.model("Review", ReviewSchema);
module.exports = reviews;