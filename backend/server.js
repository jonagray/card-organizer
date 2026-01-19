require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const Card = require("./models/Card");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting configuration
// General API rate limiter - applies to all requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 registration/login attempts per hour
  message: { error: "Too many authentication attempts from this IP, please try again after an hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Moderate rate limiter for card creation/upload
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 card uploads per hour
  message: { error: "Too many uploads from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Configure AWS S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// Middleware
app.use(bodyParser.json());

// CORS configuration - allow Netlify frontend
const corsOptions = {
  origin: [
    'https://mycardorganizer.netlify.app',
    'http://localhost:3000', // For local development
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Apply general rate limiter to all requests
app.use(generalLimiter);

app.use(express.static(path.join(__dirname, "../frontend")));

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cardOrganizerDB";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));

// Card image upload setup with S3
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET || 'card-organizer-images-jonnyg',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueFileName = Date.now() + "-" + file.originalname;
      cb(null, `cards/${uniqueFileName}`);
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Auth routes
app.use("/auth", authRoutes);

// Health check endpoint for Railway
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", port: PORT });
});

app.get("/", (req, res) => {
  res.send("Welcome to the Greeting Card Organizer API");
});

// Fetch cards with filtering, sorting, search, and pagination (protected)
app.get("/cards", authMiddleware, async (req, res) => {
  const { occasion, from, to, sort, search, page = 1, limit = 10 } = req.query;
  const query = { userId: req.userId }; // Only show cards for the authenticated user

  // Apply occasion filter
  if (occasion) query.occasion = occasion;

  // Apply "From" filter (now supports arrays)
  if (from) query.from = { $in: [from] };

  // Apply "To" filter (now supports arrays)
  if (to) query.to = { $in: [to] };

  // Apply search filter (updated for array fields)
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { from: { $elemMatch: { $regex: search, $options: "i" } } },
      { to: { $elemMatch: { $regex: search, $options: "i" } } },
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

// Fetch unique "to" recipients (protected) - updated for array fields
app.get("/tos", authMiddleware, async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.userId }, 'to');
    const uniqueTo = [...new Set(cards.flatMap(card => card.to))].filter(Boolean);
    res.json(uniqueTo);
  } catch (err) {
    res.status(500).json({ message: "Error fetching recipients", error: err });
  }
});

// Fetch unique "from" senders (protected) - new endpoint for array fields
app.get("/froms", authMiddleware, async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.userId }, 'from');
    const uniqueFrom = [...new Set(cards.flatMap(card => card.from))].filter(Boolean);
    res.json(uniqueFrom);
  } catch (err) {
    res.status(500).json({ message: "Error fetching senders", error: err });
  }
});

// Autocomplete endpoint for all fields (protected)
app.get("/autocomplete/:field", authMiddleware, async (req, res) => {
  try {
    const { field } = req.params;
    const allowedFields = ['from', 'to', 'occasion', 'title'];

    if (!allowedFields.includes(field)) {
      return res.status(400).json({ message: "Invalid field for autocomplete" });
    }

    let uniqueValues;
    if (field === 'from' || field === 'to') {
      // For array fields, flatten and get unique values
      const cards = await Card.find({ userId: req.userId }, field);
      uniqueValues = [...new Set(cards.flatMap(card => card[field]))].filter(Boolean);
    } else {
      // For string fields, use distinct
      uniqueValues = await Card.distinct(field, { userId: req.userId });
    }

    res.json(uniqueValues.sort());
  } catch (err) {
    res.status(500).json({ message: `Error fetching autocomplete for ${req.params.field}`, error: err });
  }
});

// API to upload card data (protected)
app.post("/upload", authMiddleware, uploadLimiter, upload.array("pages", 5), async (req, res) => {
  let { title, from, to, occasion, flipOrientation, note } = req.body;
  // S3 files have 'location' property with full URL
  const pages = req.files.map(file => file.location);

  // Convert from/to to arrays if they're strings (handles JSON or comma-separated values)
  if (typeof from === 'string') {
    try {
      // Try parsing as JSON first
      from = JSON.parse(from);
    } catch (e) {
      // If not JSON, treat as comma-separated or single value
      from = from.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  if (typeof to === 'string') {
    try {
      // Try parsing as JSON first
      to = JSON.parse(to);
    } catch (e) {
      // If not JSON, treat as comma-separated or single value
      to = to.split(',').map(s => s.trim()).filter(Boolean);
    }
  }

  // Ensure from/to are arrays
  from = Array.isArray(from) ? from : [from].filter(Boolean);
  to = Array.isArray(to) ? to : [to].filter(Boolean);

  const card = new Card({
    title,
    from,
    to,
    occasion: occasion || "Miscellaneous", // Default to "Miscellaneous" if not provided
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

    // Convert from/to to arrays if they're strings
    if (req.body.from && typeof req.body.from === 'string') {
      try {
        req.body.from = JSON.parse(req.body.from);
      } catch (e) {
        req.body.from = req.body.from.split(',').map(s => s.trim()).filter(Boolean);
      }
      req.body.from = Array.isArray(req.body.from) ? req.body.from : [req.body.from].filter(Boolean);
    }
    if (req.body.to && typeof req.body.to === 'string') {
      try {
        req.body.to = JSON.parse(req.body.to);
      } catch (e) {
        req.body.to = req.body.to.split(',').map(s => s.trim()).filter(Boolean);
      }
      req.body.to = Array.isArray(req.body.to) ? req.body.to : [req.body.to].filter(Boolean);
    }

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

// Migration endpoint - converts from/to fields from String to Array
// WARNING: This is a one-time operation. Only run once!
app.post("/migrate-to-arrays", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const cardsCollection = db.collection('cards');

    // Find all cards where 'from' or 'to' are strings (not arrays)
    const cardsToMigrate = await cardsCollection.find({
      $or: [
        { from: { $type: 'string' } },
        { to: { $type: 'string' } }
      ]
    }).toArray();

    if (cardsToMigrate.length === 0) {
      return res.json({
        message: "No cards need migration. All cards already use array format.",
        migratedCount: 0,
        totalProcessed: 0
      });
    }

    let migratedCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const card of cardsToMigrate) {
      try {
        const updateFields = {};

        // Convert 'from' if it's a string
        if (typeof card.from === 'string') {
          updateFields.from = card.from.trim() ? [card.from.trim()] : [];
        }

        // Convert 'to' if it's a string
        if (typeof card.to === 'string') {
          updateFields.to = card.to.trim() ? [card.to.trim()] : [];
        }

        // Update the card
        await cardsCollection.updateOne(
          { _id: card._id },
          { $set: updateFields }
        );

        migratedCount++;
      } catch (err) {
        errorCount++;
        errors.push({ cardId: card._id, error: err.message });
      }
    }

    res.json({
      message: "Migration completed",
      migratedCount,
      errorCount,
      totalProcessed: cardsToMigrate.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    res.status(500).json({
      message: "Migration failed",
      error: err.message
    });
  }
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server bound to 0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});