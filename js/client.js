// CLIENT

// JS of the main website(where the client will come and connect)


// to use server's socket in this client javascript
const socket = io("http://localhost:8000")

// these we are using of our html (Getting DOM elements in respective js variable)
const form = document.getElementById('send-container')
const messageInput = document.getElementById("messageInp")
// whenever message comes we put it in .container
const messageContainer= document.querySelector(".container")
const onlineContainer = document.querySelector(".online-box")

var audio = new Audio('ting.mp3')

//function(named append) to add message in the box (Note: strings are written inside inverted commas and variables are not)
const append= (message, position, type)=>{
    const messageElement= document.createElement('div');
    if(type=='join-left'){
        messageElement.innerText = message;
        messageElement.classList.add('join-left')
    }
    else if(type=='message-sent'){
        messageElement.innerText = message;
        messageElement.classList.add('message')
    }
    else{
        // const messageElementName = document.createElement('h2')
        messageElement.innerHTML= `<h3>${message.name}</h3> <p>${message.message}</p>`
        messageElement.classList.add('message')
    }
    messageElement.classList.add(position)
    messageContainer.append(messageElement)
    if(position=="left"){
        audio.play();
    }
}

const onlineAppend=(userNameArray,userIdArray,onlineUserNo)=>{
    nameElement= document.createElement('div')
    nameElement.innerHTML =`<svg height="12" width="12"><circle cx="6" cy="6" r="5" fill="green"/> </svg> ${userNameArray[onlineUserNo-1]}`
    nameElement.setAttribute('id',userIdArray[onlineUserNo-1])
    nameElement.setAttribute('class','onlineUser')
    onlineContainer.append(nameElement)
}

const onlineAppendAll=(userNameArray,userIdArray,onlineUserNo)=>{
    nameElement= document.createElement('div')
    nameElement.innerHTML =`<svg height="12" width="12"><circle cx="6" cy="6" r="5" fill="green"/> </svg> You`
    nameElement.setAttribute('id',userIdArray[onlineUserNo-1])
    nameElement.setAttribute('class','onlineUser')
    onlineContainer.append(nameElement)
    for(i=0;i<(onlineUserNo-1);i++){
        nameElement= document.createElement('div')
        nameElement.innerHTML =`<svg height="12" width="12"><circle cx="6" cy="6" r="5" fill="green"/> </svg> ${userNameArray[i]}`
        nameElement.setAttribute('id',userIdArray[i])
        nameElement.setAttribute('class','onlineUser')
        onlineContainer.append(nameElement)
    }
}

const onlineRemove=(userNameArray,userIdArray,onlineUserNo)=>{
    var name = document.getElementById(userIdArray[onlineUserNo-1])
    onlineContainer.removeChild(name)
}
//adding event listner in form for submission
form.addEventListener('submit',(e)=>{
    //to prevent from reload we write
    e.preventDefault();
    const message= messageInput.value;
    if(message.trim() != ''){
        append(`${message}`, 'right','message-sent')
        socket.emit('send', message)
        messageInput.value =""
    }
})


for(;;){
    var name = prompt('Enter Your Name To Join')
    if(name!='' && name!= 'null'){
        break
    }
}
// now as soon as we enter the name we will emit(or send) a "new-user-joined" event to the server javascript with the argument "name"
socket.emit('new-user-joined',name)

// receive a message from the server ie. when server javascript will send the event 'user joined' with arg as data then socket.on will listen that and perfome this arrow function will be performed(Note: we havent given brackets to "data" but it is an arrow function) 
socket.on('user-joined', (userNameArray,userIdArray,onlineUserNo)=>{
    append(`${userNameArray[onlineUserNo-1]} joined the chat`,'center','join-left')
    onlineAppend(userNameArray,userIdArray,onlineUserNo)
})

socket.on('currentOnlineUsers', (userNameArray,userIdArray,onlineUserNo)=>{
    onlineAppendAll(userNameArray,userIdArray,onlineUserNo)
})



socket.on('recieve', data=>{
    append(data,'left','message')
})

socket.on('user-left', (userNameArray,userIdArray,onlineUserNo)=>{
    append(`${userNameArray[onlineUserNo-1]} left the chat`, 'center','join-left')
    onlineRemove(userNameArray,userIdArray,onlineUserNo)
})