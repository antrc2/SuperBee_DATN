// src/utils/jwt.js
import jwt from "jsonwebtoken";
import config from "../../config/index.js";

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return null;
  }
};

export { verifyToken };
