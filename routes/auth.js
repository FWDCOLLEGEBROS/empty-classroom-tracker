const express = require("express");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const dataFile = path.join(__dirname, "../users.json");

// ✅ Load users from file
function loadUsers() {
  if (!fs.existsSync(dataFile)) return [];
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

// ✅ Save users to file
function saveUsers(users) {
  fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
}

// ✅ SIGNUP (NO CAPTCHA)
router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.send("All fields required");
  }

  let users = loadUsers();

  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.send("User already exists");
  }

  const hash = await bcrypt.hash(password, 10);
  users.push({ name, email, password: hash, role });

  saveUsers(users);
  res.send("Signup Success");
});

// ✅ LOGIN (SESSION FIXED)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let users = loadUsers();
  const user = users.find(u => u.email === email);

  if (!user) return res.send("NOT_REGISTERED");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.send("INVALID");

  req.session.user = {
    email: user.email,
    role: user.role
  };

  res.send(user.role); // faculty or student
});

// ✅ CHECK CURRENT LOGIN
router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).send("Not logged in");
  }

  res.json(req.session.user);
});

// ✅ LOGOUT
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/index.html");
  });
});

module.exports = router;
