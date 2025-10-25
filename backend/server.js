require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const path = require("path"); // Add this line to handle paths
const Card = require("./models/Card");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../frontend"))); // Adjusted path
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cardOrganizerDB";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// Card image upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// Auth routes
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the Greeting Card Organizer API");
});

// Fetch cards with filtering, sorting, search, and pagination (protected)
app.get("/cards", authMiddleware, async (req, res) => {
  const { occasion, from, sort, search, page = 1, limit = 10 } = req.query;
  const query = { userId: req.userId }; // Only show cards for the authenticated user

  // Apply occasion filter
  if (occasion) query.occasion = occasion;

  // Apply "From" filter
  if (from) query.from = from;

  // Apply search filter
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { from: { $regex: search, $options: "i" } },
      { occasion: { $regex: search, $options: "i" } }
    ];
  }

  try {
    const cards = await Card.find(query)
      .sort(sort === 'newest' ? { upload_date: -1 } : { upload_date: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(cards);
  } catch (err) {
    res.status(500).json({ message: "Error fetching cards", error: err });
  }
});

// Fetch a single card by ID (protected)
app.get("/cards/:id", authMiddleware, async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, userId: req.userId });
    if (!card) return res.status(404).json({ message: "Card not found" });
    res.json(card);
  } catch (err) {
    res.status(500).json({ message: "Error fetching card", error: err });
  }
});

// Fetch unique occasions (protected)
app.get("/occasions", authMiddleware, async (req, res) => {
  try {
    const occasions = await Card.distinct("occasion", { userId: req.userId });
    res.json(occasions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching occasions", error: err });
  }
});

// API to upload card data (protected)
app.post("/upload", authMiddleware, upload.array("pages", 5), async (req, res) => {
  const { title, from, occasion, flipOrientation, note } = req.body;
  const pages = req.files.map(file => `/uploads/${file.filename}`);

  const card = new Card({
    title,
    from,
    occasion,
    flipOrientation,
    note: note || "", // Add note if provided, or default to an empty string
    pages,
    userId: req.userId // Associate card with authenticated user
  });

  try {
    await card.save();
    res.json({ success: true, card });
  } catch (error) {
    res.status(500).json({ message: "Error saving card", error });
  }
});

// Update a card by ID (protected)
app.put("/cards/:id", authMiddleware, async (req, res) => {
  try {
    // Don't allow updating userId
    delete req.body.userId;

    const updatedCard = await Card.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!updatedCard) return res.status(404).json({ message: "Card not found" });
    res.json(updatedCard);
  } catch (err) {
    res.status(400).json({ message: "Error updating card", error: err });
  }
});

// Delete a card by ID (protected)
app.delete("/cards/:id", authMiddleware, async (req, res) => {
  try {
    const deletedCard = await Card.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deletedCard) return res.status(404).json({ message: "Card not found" });
    res.json({ message: "Card deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting card", error: err });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});