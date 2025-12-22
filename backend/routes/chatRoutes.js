const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { accessChat, fetchChats } = require("../controllers/chatControllers");

const router = express.Router();

// Only logged-in users can access these routes (protect middleware)
router.route("/").post(protect, accessChat); // Create/Access Chat
router.route("/").get(protect, fetchChats);  // Get all Chats

module.exports = router;