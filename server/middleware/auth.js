import jwt from "jsonwebtoken";

// Protects a route. Usage: router.get("/x", requireAuth, handler)
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId; // available to downstream route handlers
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}