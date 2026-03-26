const jwt = require("jsonwebtoken");

function auth(roles) {
  return function (req, res, next) {
    try {
      const header = req.headers.authorization || "";
      const token = header.replace("Bearer ", "").trim();
      if (!token) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const SECRET = process.env.JWT_SECRET || "sps_secret";
      const decoded = jwt.verify(token, SECRET);
      if (roles && roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: "Access denied" });
      }
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
  };
}

module.exports = auth;
