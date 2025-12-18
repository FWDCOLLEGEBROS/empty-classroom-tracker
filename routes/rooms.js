const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { requireLogin, isFaculty } = require("../middleware/authMiddleware");

const roomsFile = path.join(__dirname, "../roomsData.json");
const reportFile = path.join(__dirname, "../attendanceLogs.json");

const CLASS_DURATION = 55 * 60 * 1000;

// helpers
const loadRooms = () => JSON.parse(fs.readFileSync(roomsFile, "utf8"));
const saveRooms = d => fs.writeFileSync(roomsFile, JSON.stringify(d, null, 2));
const loadReports = () => JSON.parse(fs.readFileSync(reportFile, "utf8"));
const saveReports = d => fs.writeFileSync(reportFile, JSON.stringify(d, null, 2));

// ✅ GET ROOMS
router.get("/", requireLogin, (req, res) => {
  const rooms = loadRooms();
  res.json(rooms[req.query.block] || {});
});

// ✅ UPDATE ROOM
router.post("/update", requireLogin, isFaculty, (req, res) => {
  const { block, floor, roomNum } = req.body;
  const user = req.session.user;

  const rooms = loadRooms();

  // ❌ already has another active class
  for (const b in rooms) {
    for (const f in rooms[b]) {
      for (const r of rooms[b][f]) {
        if (r.status === "occupied" && r.markedBy === user.email) {
          if (!(b === block && f === floor && r.roomNum === roomNum)) {
            return res.status(403).send("You already marked another class");
          }
        }
      }
    }
  }

  const room = rooms[block][floor].find(r => r.roomNum === roomNum);

  // ❌ occupied by other faculty
  if (room.status === "occupied" && room.markedBy !== user.email) {
    return res.status(403).send("Room already occupied");
  }

  // 🔁 TOGGLE
  if (room.status === "empty") {
    room.status = "occupied";
    room.markedBy = user.email;
    room.markedName = user.name;
    room.startTime = Date.now();
    room.endTime = room.startTime + CLASS_DURATION;

    const reports = loadReports();
    reports.push({
      name: user.name,
      email: user.email,
      block,
      floor,
      roomNum,
      startTime: room.startTime,
      endTime: room.endTime
    });
    saveReports(reports);
  } else {
    room.status = "empty";
    room.markedBy = null;
    room.markedName = null;
    room.startTime = null;
    room.endTime = null;
  }

  saveRooms(rooms);
  res.send("UPDATED");
});

module.exports = router;
