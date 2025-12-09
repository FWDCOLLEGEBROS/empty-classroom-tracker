const express = require("express");
const router = express.Router();
const AudiBooking = require("../models/AudiBooking");
const { requireLogin, isFaculty } = require("../middleware/authMiddleware");

// ✅ GET SLOTS
router.get("/", requireLogin, async (req, res) => {
  const { audi, date } = req.query;

  const slots = [
    "9:00 AM - 11:00 AM",
    "11:00 AM - 1:00 PM",
    "2:00 PM - 4:00 PM",
    "4:00 PM - 6:00 PM"
  ];

  const bookings = await AudiBooking.find({ audiName: audi, date });

  const output = slots.map(s => {
    const found = bookings.find(b => b.slot === s);
    return found
      ? { slot: s, booked: true, bookedBy: found.bookedBy }
      : { slot: s, booked: false };
  });

  res.json(output);
});

// ✅ BOOK SLOT
router.post("/book", requireLogin, isFaculty, async (req, res) => {
  const { audi, date, slot } = req.body;
  const userId = req.session.user._id;

  try {
    await AudiBooking.create({
      audiName: audi,
      date,
      slot,
      bookedBy: userId
    });

    res.send("BOOKED");
  } catch {
    res.send("ALREADY_BOOKED");
  }
});

// ✅ CANCEL SLOT (ONLY OWNER)
router.post("/cancel", requireLogin, isFaculty, async (req, res) => {
  const { audi, date, slot } = req.body;
  const userId = req.session.user._id;

  const booking = await AudiBooking.findOne({ audiName: audi, date, slot });

  if (!booking) return res.send("NOT_FOUND");
  if (booking.bookedBy.toString() !== userId) {
    return res.status(403).send("NOT_ALLOWED");
  }

  await AudiBooking.deleteOne({ _id: booking._id });
  res.send("CANCELLED");
});

module.exports = router;