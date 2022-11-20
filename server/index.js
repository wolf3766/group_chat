const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose= require("mongoose");
const Messages=require("./models/groupChat");

const app = express();
app.use(cors({credentials:true}));
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

mongoose
    .connect('mongodb://localhost:27017/groupChat')
    .then(connection =>console.log('DB CONNECTED'))
    .catch(e => console.log(`Error occured ${e}`));


app.post("/register",(req,res)=>{
    const data=new UserData({
      email:req.body.mail,
      password:req.body.password
    });
    data.save();
    res.send("done!");
})


io.on("connection", (socket) => { 

  socket.on("join_room", (data,mail) => {
    socket.join(data);
    Messages.findOne({roomID:data},(err,doc)=>{
      if(!doc){
        const arr=[mail];
          const group=new Messages({
              users:arr,
              sender:mail,
              message:"joining",
              roomID:data
          });
          group.save();
      }else{
        if(!doc.users.includes(mail)){
          doc.users.push(mail);
          doc.save();
        }
      }
    })
    console.log(`User with ID: ${socket.id} joined room: ${data} with mail id ${mail}`);
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
    Messages.findOne({roomID:data.room},(err,doc)=>{
        if(err){
          throw err;
        }else{
          console.log(doc);
          const message=new Messages({
            users:doc.users,
            sender:data.sender,
            message:data.message,
            roomID:doc.roomID
          });
          message.save();
        }
    })
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});


const PORT=process.env.port || 3001;
server.listen(PORT, () => {
  console.log(`SERVER RUNNING ${PORT}`);
});

