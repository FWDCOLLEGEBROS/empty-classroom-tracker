const express = require("express");
const router = express.Router();
const AudiBooking = require("../models/AudiBooking");
const { requireLogin, isFaculty } = require("../middleware/authMiddleware");

// ✅ GET SLOTS (ANY LOGGED-IN USER)
router.get("/", requireLogin, async (req, res) => {
  const { audi, date } = req.query;

  const slots = [
    "9:00 AM - 11:00 AM",
    "11:00 AM - 1:00 PM",
    "2:00 PM - 4:00 PM",
    "4:00 PM - 6:00 PM"
  ];

  const bookings = await AudiBooking.find({ audiName: audi, date });

  const output = slots.map(slot => {
    const found = bookings.find(b => b.slot === slot);
    return found
      ? { slot, booked: true, bookedBy: found.bookedBy }
      : { slot, booked: false };
  });

  res.json(output);
});

// ✅ BOOK SLOT (FACULTY ONLY)
router.post("/book", requireLogin, isFaculty, async (req, res) => {
  const { audi, date, slot } = req.body;

  // ✅ FIX: use email (NOT _id)
  const userEmail = req.session.user.email;

  try {
    await AudiBooking.create({
      audiName: audi,
      date,
      slot,
      bookedBy: userEmail
    });

    res.send("BOOKED");
  } catch (err) {
    res.send("ALREADY_BOOKED");
  }
});

// ✅ CANCEL SLOT (ONLY SAME FACULTY)
router.post("/cancel", requireLogin, isFaculty, async (req, res) => {
  const { audi, date, slot } = req.body;
  const userEmail = req.session.user.email;

  const booking = await AudiBooking.findOne({ audiName: audi, date, slot });

  if (!booking) return res.send("NOT_FOUND");

  // ✅ FIX: Compare with email
  if (booking.bookedBy !== userEmail) {
    return res.status(403).send("NOT_ALLOWED");
  }

  await AudiBooking.deleteOne({ _id: booking._id });
  res.send("CANCELLED");
});

module.exports = router;