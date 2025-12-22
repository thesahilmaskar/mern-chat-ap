const express = require("express");
const {
  registerUser,
  authUser,
  allUsers, // <--- Import the new function
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware"); // <--- Import Middleware

const router = express.Router();

// Chain the routes:
// POST / -> Register
// GET / -> Search Users (Protected)
router.route("/").post(registerUser).get(protect, allUsers);

router.post("/login", authUser);

module.exports = router;