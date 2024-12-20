// backend/models/Card.js
const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  from: { type: String, required: true },
  occasion: { type: String, required: true },
  pages: { type: [String], required: true }, // Array of image URLs or paths
  flipOrientation: { type: String, default: "horizontal" }, // Orientation of the card
  note: { type: String, default: "" }, // Optional note
  upload_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Card", cardSchema);