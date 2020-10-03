const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Model
const Categoria = new Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now(),

    }
});

//Collection
mongoose.model("categories", Categoria);