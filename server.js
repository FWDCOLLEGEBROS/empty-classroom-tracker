// server.js
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");

const app = express();

// 🔹 CORS – ONLY needed if you ever open frontend from a different port
// For your current setup (frontend also on 3000), you could even remove cors()
// but this is safe for now.
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// 🔹 Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 Session configuration
app.use(
  session({
    secret: "bmsce-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // must be false for http:// localhost (no https)
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// 🔹 Serve static frontend from /public
app.use(express.static(path.join(__dirname, "public")));

// 🔹 Routes
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
const audiRoutes = require("./routes/audi");

app.use("/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/audi", audiRoutes);

// 🔹 Default route – open login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 🔹 Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
