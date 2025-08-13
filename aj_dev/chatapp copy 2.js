const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Accept from anywhere for now
    methods: ["GET", "POST"]
  }
});


let onlineUsers = {};

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    //When user register with user_id
    socket.on("register_client", ({ group_id, user_id }) => {
        socket.join(`group_${group_id}`);
        onlineUsers[user_id] = socket.id;
        console.log(`User ${user_id} register with socket ${socket.id}`);
    });



    
    // When message is sent
    socket.on("send_message", (data) => {
        const { to_user_id, message } = data;
        const targetSocket = onlineUsers[to_user_id];
        if (targetSocket) {
            io.to(targetSocket).emit("receive_message", {
                from: data.from_user_id,
                message: message
            });
        }
    });
    



    //On disconnect
    socket.on("disconnect", () => {
        for (let userId in onlineUsers) {
            if (onlineUsers[userId] === socket.id) {
                delete onlineUsers[userId];
                break;
            }
        }
        console.log("User disconnected:", socket.id);
    });

});


const PORT = 3001;
server.listen(PORT, () => {
  console.log(`✅ Socket.IO Server running on http://localhost:${PORT}`);
});
