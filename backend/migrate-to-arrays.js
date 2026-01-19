// Migration script to convert from/to fields from String to Array
require('dotenv').config();
const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/cardOrganizerDB";

async function migrateCards() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const cardsCollection = db.collection('cards');

    // Find all cards where 'from' or 'to' are strings (not arrays)
    const cardsToMigrate = await cardsCollection.find({
      $or: [
        { from: { $type: 'string' } },
        { to: { $type: 'string' } }
      ]
    }).toArray();

    console.log(`Found ${cardsToMigrate.length} cards to migrate`);

    if (cardsToMigrate.length === 0) {
      console.log("No cards need migration. Exiting.");
      await mongoose.connection.close();
      return;
    }

    let migratedCount = 0;
    let errorCount = 0;

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
        console.log(`Migrated card ${card._id}: from="${card.from}" to="${card.to}"`);
      } catch (err) {
        errorCount++;
        console.error(`Error migrating card ${card._id}:`, err.message);
      }
    }

    console.log("\n=== Migration Complete ===");
    console.log(`Successfully migrated: ${migratedCount} cards`);
    console.log(`Errors: ${errorCount} cards`);
    console.log(`Total processed: ${cardsToMigrate.length} cards`);

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

// Run the migration
migrateCards();
