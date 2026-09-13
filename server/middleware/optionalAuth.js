import jwt from "jsonwebtoken";

// If a valid token is present, req.userId is set.
// If it's missing or invalid, req.userId stays null and the request
// continues as a guest request (no error).
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = payload.userId;
    } catch (err) {
      req.userId = null;
    }
  } else {
    req.userId = null;
  }

  next();
}