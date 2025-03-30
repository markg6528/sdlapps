
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String },
    isbn: { type: String },
    dateOfPublication: { type: Date },
    copies: { type: Number, required: true }
});

module.exports = mongoose.model('Book', bookSchema);