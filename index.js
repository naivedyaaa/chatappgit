// Note: node server is different and the website is different and we evern start both in different servers ie. website(which is connected to client.js) runs in 5500 port(live server port) and index.js in 8000 port


// SERVER 

// Node server which will handel socket io connections

// we want to use socket.io at 8000 port origin * so that cors do not block the site

const http = require('http');
const express = require('express'),
app = module.exports.app = express();

const server = http.createServer(app);
const io = require('socket.io')(server, {cors:{origin: '*'}});  //pass a http.Server instance


// const express=require("express");
// const app = express();
const port=(process.env.PORT || 8000 )
// const io = require("socket.io").listen(app)               // (port, {cors:{origin: '*'}})
const { dirname } = require("path");

app.use('/static' , express.static("static"))
let users = {};
let usersId = {};
let onlineUserNo =-1

// when connection comes(ie harry , rohan ...) to socket.io then "io.on" will listen these
// and whenever something happens with a particular connection(ie rohan) then what should be done with that particular connection is handled by "socket.on" so if a "new-user-joined" event(note: it is our wish whatever name we want to keep here we kept "new-user-joined") comes to socket.on then the callback function is run which takes the argument "socket"
io.on("connection", socket=>{
    // var address = socket.handshake.address;
    // console.log('New connection from ' + address.address + ':' + address.port);
    // socket.on will receive a message or event from the client javascript 
    // socket.on("hello from client", (...args) =>{ }) here name is argument
    socket.on('new-user-joined', name=>{
        // console.log("New user",name);
        // when new user joins it will add the user name in users array
        onlineUserNo += 1             // onlineUserNo is starting from 0
        usersId[onlineUserNo]= socket.id
        users[onlineUserNo] = name
        // socket.broadcast.emit() functon will emit or send a message(event) to all the client's javascript(except the client that caused it) 'user-joined' with name as argument
        socket.broadcast.emit('user-joined',users,usersId,onlineUserNo)
        // socket.emit() will send a message only to the client that caused it
        socket.emit('currentOnlineUsers',users,usersId,onlineUserNo)
    });
    // if socket get an event whose name we kept as 'send' from the client javascript then
    socket.on('send' , (message,clientOnlineUserNo)=>{
        // here user[socket.id] will give the name of the client from user array which we created before and we are keeping all the values as object
        socket.broadcast.emit('recieve', {message: message, name: users[clientOnlineUserNo] })
    });
    // when a client diconnects(this event is automatically triggered by socket.io as soon as the client disconnects)
    socket.on('disconnect', message=>{
        let userLeftId=socket.id;
        let onlineUserLeftNo;
        for(i=0;i<=onlineUserNo;i++){
            if(usersId[i]==userLeftId){
                onlineUserLeftNo=i;
                break
            }
        }
        socket.broadcast.emit('user-left',onlineUserLeftNo)
        users[onlineUserLeftNo]=undefined
        usersId[onlineUserLeftNo]=undefined
    })
});

app.use(function(req,res,next){
    res.header("Access-Control-Allow-Origin","*");
    res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept")
    next();
})

app.get('/', (req, res) => {
    res.sendFile(__dirname+"/"+'index.html')       
  })

server.listen(port,()=>{
    console.log(`The application started successfully on port ${port}`)
})