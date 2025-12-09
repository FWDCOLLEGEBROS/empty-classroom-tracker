// models/Room.js
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  block: { type: String, required: true },   // e.g. "PG Block"
  roomNum: { type: String, required: true }, // e.g. "01", "11", "21"
  status: { type: String, enum: ["empty", "occupied"], default: "empty" },
  startTime: { type: Date, default: null },
  endTime: { type: Date, default: null },
});

roomSchema.index({ block: 1, roomNum: 1 }, { unique: true });

module.exports = mongoose.model("Room", roomSchema);
