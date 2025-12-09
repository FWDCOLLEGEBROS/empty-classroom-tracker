// models/AudiBooking.js
const mongoose = require("mongoose");

const audiBookingSchema = new mongoose.Schema({
  audiName: { type: String, required: true }, // Audi1, Audi2
  date: { type: String, required: true },     // YYYY-MM-DD
  slot: { type: String, required: true },     // "9:00 AM - 11:00 AM"
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

audiBookingSchema.index({ audiName: 1, date: 1, slot: 1 }, { unique: true });

module.exports = mongoose.model("AudiBooking", audiBookingSchema);
