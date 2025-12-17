import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();

//  middleware on app
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

//store room info : {'room code ' : 'adminSocketId'}
//store admin id if the admin leaves we delete the room \
const rooms = {};

//middelwares 
app.use(express.json());

const server = http.createServer(app);

//  socket.io CORS (important)
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

// socket logic
io.on("connection", (socket) => {
  console.log("user connected:", socket.id);
  socket.on('chat message',(msg)=>{
    console.log(msg)
    io.emit('chat message', msg)
  })

  //create room 
  socket.on('create-room',(callback)=>{
    //generate room code of 6 charcters 
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // join the socket to this room 
    // join created socket (user ) to new room which others can join by giving the room code 
    socket.join(roomCode);
    // mark this socket as the admin 
    rooms[roomCode] = socket.id;

    //send the code back to frontend ?
    callback({roomCode})
    console.log(`Room created: ${roomCode} by ${socket.id}`);

  })


// join room with code 
  socket.on('join-room', (roomCode , callback)=>{
  //check if room exists 
  if(rooms[roomCode])
  {
    //join this user to the room 
    socket.join(roomCode);
    callback({ success: true })
    console.log(`${socket.id} joined ${roomCode}`);
    
    // notify others about new entrance 
    socket.to(roomCode).emit("system message" , "A stranger has joined the room")
  }
  else{
    callback({success : false , error : 'wrong code or the room does not exists'})
  }
});


// send message to paticular rooms 
socket.on('send-message' , ({roomCode , message})=>{
  // send message to a paticular room 
  socket.to(roomCode).emit("receive-message" , message);
})

// kill the room if the admin diconnects 
socket.on('disconnect', ()=>{

  // check if the user was admin 
  const roomCode = Object.keys(rooms).find(key => rooms[key] === socket.id);

  if(roomCode)
  {
    // notify everyone that room is closed 
    io.to(roomCode).emit("room closed")

    //delete this room from the storage 
    delete rooms[roomCode];
    console.log(`Room ${roomCode} closed because admin left.`);
  }

})
});



server.listen(8000, () => {
  console.log("listening to server");
});