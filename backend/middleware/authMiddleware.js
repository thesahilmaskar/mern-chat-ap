const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("express-async-handler");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check if token is sent in the header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2. Decode the token (remove "Bearer " string)
      token = req.headers.authorization.split(" ")[1];

      // 3. Verify the signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find the user in DB and attach to the request object (without password)
      req.user = await User.findById(decoded.id).select("-password");

      next(); // Move to the next operation
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

module.exports = { protect };