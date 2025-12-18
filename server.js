// server.js
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");

// ✅ CREATE APP
const app = express();

// ✅ CORS (frontend + backend on same port, still safe)
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true
  })
);

// ✅ BODY PARSERS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ SESSION CONFIG
app.use(
  session({
    secret: "bmsce-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false // http localhost
    }
  })
);

// ✅ STATIC FILES (frontend)
app.use(express.static(path.join(__dirname, "public")));

// ================= ROUTES =================
const authRoutes = require("./routes/auth");
const roomRoutes = require("./routes/rooms");
const audiRoutes = require("./routes/audi");
const reportRoutes = require("./routes/reports"); // ✅ ADD THIS

app.use("/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/audi", audiRoutes);
app.use("/api/reports", reportRoutes); // ✅ ADD THIS

// ✅ DEFAULT PAGE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ START SERVER
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
