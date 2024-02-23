require("dotenv").config();
const mongoose = require("mongoose");
const app = require("express")();
const http = require("http").Server(app);
const userRoute = require("./routes/userRoute");
const io = require("socket.io")(http);
const User = require("./models/userModel");
const Chat = require("./models/chatModel");

const usp = io.of("/user-namespace");

usp.on("connection", async (socket) => {
  console.log("User Connected");
  const userId = socket.handshake.auth.token;

  await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: "1" } });

  // user broadcast online status
  socket.broadcast.emit("getOnlineUser", { user_id: userId });

  socket.on("disconnect", async () => {
    console.log("User Disconnected");
    await User.findByIdAndUpdate({ _id: userId }, { $set: { is_online: "0" } });

    // user broadcast offline status
    socket.broadcast.emit("getOfflineUser", { user_id: userId });
  });
  // Chatting implementation
  socket.on("newChat", (data) => {
    socket.broadcast.emit("loadNewChat", data);
  });

  // Load old chats
  socket.on("existsChat", async (data) => {
    const Chats = await Chat.find({
      $or: [
        {
          sender_id: data.sender_id,
          receiver_id: data.receiver_id,
        },
        {
          sender_id: data.receiver_id,
          receiver_id: data.sender_id,
        },
      ],
    });
    socket.emit("loadChats", { chats: Chats });
  });

  // Delete chat
  socket.on("chatDeleted", function (id) {
    console.log("aavyo ke nahi"+id);
    socket.broadcast.emit("chatMessageDeleted", id);
  });
});

mongoose.connect(
  "mongodb+srv://harsh:harsh@demoproject.eij1cj6.mongodb.net/dynamic-chat-app"
);
app.use("/", userRoute);
http.listen(3000, () => {
  console.log("Server is Running");
});
