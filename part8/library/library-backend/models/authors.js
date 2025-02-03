const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, minlenght: 4 },
  born: { type: Number },
});

module.exports = mongoose.model("Author", authorSchema);
