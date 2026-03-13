import jwt from "jsonwebtoken";

/**
 * Middleware to verify JWT token
 * Named Export: verifyToken
 */
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({
    success: false,
    message: "No token provided"
  });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};
