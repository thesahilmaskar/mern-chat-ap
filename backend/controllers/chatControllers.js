const asyncHandler = require("express-async-handler");
const Chat = require("../models/Chat");
const User = require("../models/User");

// 1. Create or Fetch a One-on-One Chat
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body; // The ID of the user you want to chat with

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  // Check if a chat already exists between these two users
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } }, // You
      { users: { $elemMatch: { $eq: userId } } },       // Them
    ],
  })
    .populate("users", "-password") // Turn User IDs into actual User Data (minus password)
    .populate("latestMessage");

  // Populate the sender info inside the latest message
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    // Chat exists? Send it back.
    res.send(isChat[0]);
  } else {
    // Chat doesn't exist? Create a new one.
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      // Fetch the full chat details with user info to send back
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

// 2. Fetch All Chats for the Logged-in User
const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 }) // Show newest chats first
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { accessChat, fetchChats };