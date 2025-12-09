// routes/rooms.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { requireLogin, isFaculty } = require("../middleware/authMiddleware");

const dataFile = path.join(__dirname, "../roomsData.json");
const CLASS_DURATION_MS = 55 * 60 * 1000; // 55 minutes

function loadRooms() {
  if (!fs.existsSync(dataFile)) return {};
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function saveRooms(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

// 🔹 GET ROOMS (student + faculty)
router.get("/", requireLogin, (req, res) => {
  const block = req.query.block;
  const rooms = loadRooms();
  res.json(rooms[block] || {});
});

// 🔹 UPDATE ROOM (faculty only)
router.post("/update", requireLogin, isFaculty, (req, res) => {
  const { block, floor, roomNum } = req.body;
  const userEmail = req.session.user.email; // we store email in JSON

  const rooms = loadRooms();

  if (!rooms[block] || !rooms[block][floor]) {
    return res.status(404).send("Block/Floor not found");
  }

  const room = rooms[block][floor].find(r => r.roomNum == roomNum);
  if (!room) return res.status(404).send("Room not found");

  // ✅ 1) If room is occupied by SOMEONE ELSE → block immediately
  if (
    room.status === "occupied" &&
    room.markedBy &&
    room.markedBy !== userEmail
  ) {
    return res
      .status(403)
      .send("This room is already taken by another faculty!");
  }

  // ✅ 2) Check if this faculty already has another active room
  let hasOtherActive = false;

  for (const b of Object.keys(rooms)) {
    for (const fl of Object.keys(rooms[b])) {
      for (const r of rooms[b][fl]) {
        if (
          r.status === "occupied" &&
          r.markedBy === userEmail &&
          !(b === block && fl === floor && r.roomNum == roomNum) // ignore current room
        ) {
          hasOtherActive = true;
          break;
        }
      }
      if (hasOtherActive) break;
    }
    if (hasOtherActive) break;
  }

  // If they are trying to TAKE a new room while another is active → block
  if (hasOtherActive && room.status === "empty") {
    return res
      .status(403)
      .send("You already have another class marked. Clear it first.");
  }

  // ✅ 3) Toggle this room for this faculty
  if (room.status === "empty") {
    // mark as occupied
    room.status = "occupied";
    room.markedBy = userEmail;
    room.endTime = Date.now() + CLASS_DURATION_MS;
  } else {
    // room is occupied AND either:
    //  - no markedBy (old data) OR
    //  - markedBy === userEmail  (same faculty)
    room.status = "empty";
    room.markedBy = null;
    room.endTime = null;
  }

  saveRooms(rooms);
  res.send("UPDATED");
});

module.exports = router;
