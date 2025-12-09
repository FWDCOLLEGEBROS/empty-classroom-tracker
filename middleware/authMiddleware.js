// middleware/authMiddleware.js
module.exports = {
  requireLogin: (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    }
    return res.status(401).send("UNAUTH");
  },

  isFaculty: (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === "faculty") {
      return next();
    }
    return res.status(403).send("Access Denied");
  },

  isStudent: (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === "student") {
      return next();
    }
    return res.status(403).send("Access Denied");
  },
};
