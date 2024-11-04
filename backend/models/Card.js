// backend/models/Card.js
const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  from: { type: String, required: true },
  occasion: { type: String, required: true },
  pages: { type: [String], required: true },
  upload_date: { type: Date, default: Date.now },
  flipOrientation: { type: String, default: "horizontal" } // 'horizontal' or 'vertical'
});

module.exports = mongoose.model("Card", cardSchema);