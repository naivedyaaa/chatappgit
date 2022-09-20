// Note: node server is different and the website is different and we evern start both in different servers ie. website(which is connected to client.js) runs in 5500 port(live server port) and index.js in 8000 port


// SERVER 

// Node server which will handel socket io connections

// we want to use socket.io at 8000 port origin * so that cors do not block the site
const io = require("socket.io")(process.env.PORT || 8000 , {cors:{origin: '*'}})
const express=require("express");
const { dirname } = require("path");
const app=express()

app.use('/static' , express.static("static"))
const users = [];
const usersId = [];
var onlineUserNo =0

// when connection comes(ie harry , rohan ...) to socket.io then "io.on" will listen these
// and whenever something happens with a particular connection(ie rohan) then what should be done with that particular connection is handled by "socket.on" so if a "new-user-joined" event(note: it is our wish whatever name we want to keep here we kept "new-user-joined") comes to socket.on then the callback function is run which takes the argument "socket"
io.on("connection", socket=>{
    // socket.on will receive a message or event from the client javascript 
    // socket.on("hello from client", (...args) =>{ }) here name is argument
    socket.on('new-user-joined', name=>{
        // console.log("New user",name);
        // when new user joins it will add the user name in users array
        usersId[onlineUserNo]= socket.id
        users[onlineUserNo] = name
        onlineUserNo += 1
        // socket.broadcast.emit() functon will emit or send a message(event) to all the client's javascript(except the client that caused it) 'user-joined' with name as argument
        socket.broadcast.emit('user-joined',users,usersId,onlineUserNo)
        // socket.emit() will send a message only to the client that caused it
        socket.emit('currentOnlineUsers',users,usersId,onlineUserNo)
    });
    // if socket get an event whose name we kept as 'send' from the client javascript then
    socket.on('send' , message=>{
        // here user[socket.id] will give the name of the client from user array which we created before and we are keeping all the values as object
        socket.broadcast.emit('recieve', {message: message, name: users[usersId.indexOf(socket.id)] })
    });
    // when a client diconnects(this event is automatically triggered by socket.io as soon as the client disconnects)
    socket.on('disconnect', message=>{
        socket.broadcast.emit('user-left', users,usersId,onlineUserNo)
        users.splice(onlineUserNo,1)
        console(users.splice(onlineUserNo,1))
        usersId.splice(onlineUserNo,1)
        onlineUserNo -= 1
    })
});

app.get('/', (req, res) => {
    res.sendFile(__dirname+'index.html')
  })