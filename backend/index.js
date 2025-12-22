const express = require("express");
const dotenv = require("dotenv");
//const { chats } = require("./data/data");
const connectDB = require("./config/db");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const cors = require("cors"); // <--- 1. Import CORS

dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json()); // to accept json data

app.get("/", (req, res) => {
  res.send("API is Running Successfully");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);

// ---------------- SOCKET.IO SETUP ---------------- //
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000", // Allow the Frontend to connect
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  // 1. SETUP: Create a personalized setup for the user
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  // 2. JOIN CHAT: When user clicks a chat, they join a "room"
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  // 3. SEND MESSAGE: When sending, broadcast to everyone in that room
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      // Don't send the message back to the sender
      if (user._id == newMessageRecieved.sender._id) return;

      // Send to the specific user
      socket.in(user._id).emit("message received", newMessageRecieved);
    });
  });
});