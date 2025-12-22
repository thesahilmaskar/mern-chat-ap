const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { sendMessage, allMessages } = require("../controllers/messageControllers");

const router = express.Router();

// Route to send a message
router.route("/").post(protect, sendMessage);

// Route to fetch all messages for a specific chat ID
router.route("/:chatId").get(protect, allMessages);

module.exports = router;