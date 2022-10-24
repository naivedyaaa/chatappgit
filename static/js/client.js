// CLIENT

// JS of the main website(where the client will come and connect)


// to use server's socket in this client javascript
// const socket = io("http://localhost:8000")
const socket = io("https://chat-app-naivedya.herokuapp.com/")

// these we are using of our html (Getting DOM elements in respective js variable)
const form = document.getElementById('send-container')
const messageInput = document.getElementById("messageInp")
// whenever message comes we put it in .container
const messageContainer= document.querySelector(".container")
const onlineContainer = document.querySelector(".online-box")

let audio = new Audio('static/ting.mp3')

let userNameArray=[]
let userIdArray=[]
let onlineUserNo=0
let myOnlineUserNo=0

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

const onlineListAppend=(userNameToDisplay,userIdArray,onlineUserNo)=>{
    nameElement= document.createElement('div')
    nameElement.innerHTML =`<svg height="12" width="12"><circle cx="6" cy="6" r="5" fill="green"/> </svg> ${userNameToDisplay}`
    nameElement.setAttribute('id',userIdArray[onlineUserNo])
    nameElement.setAttribute('class','onlineUser')
    onlineContainer.append(nameElement)
}

const onlineListAppendAll=()=>{
    onlineListAppend("You",userIdArray,onlineUserNo)
    onlineContainer.append(nameElement)
    for(i=Object.keys(userIdArray)[0];i<(onlineUserNo);i++){
        onlineListAppend(userNameArray[i],userIdArray,i)
    }
}

const onlineRemove=(onlineUserLeftNo)=>{
    let userLeftDiv = document.getElementById(userIdArray[onlineUserLeftNo])
    console.log(`User left UserLeftNo=${onlineUserLeftNo}, ID=${userIdArray[onlineUserLeftNo]}, Div=${userLeftDiv}`)
    onlineContainer.removeChild(userLeftDiv)
    console.log(userLeftDiv,"user left")
}
//adding event listner in form for submission
form.addEventListener('submit',(e)=>{
    //to prevent from reload we write
    e.preventDefault();
    const message= messageInput.value;
    if(message.trim() != ''){
        append(`${message}`, 'right','message-sent')
        socket.emit('send', message,myOnlineUserNo)
        messageInput.value =""
    }
})

let flagname;
let name;
let password;
let flagpass;
for(;;){
    name = prompt('Enter Your Name To Join')
    if(name!='' && name!= null){
        flagname=1;
        break
    }
}
for(;;){
    password = prompt('Enter Your Password')
    if(password=='pass'){
        flagpass=1;
        break
    }
}
// if both name and password has been entered
if(flagname==1 && flagpass==1){

    // now as soon as we enter the name we will emit(or send) a "new-user-joined" event to the server javascript with the argument "name"
    console.log("Name is",name)
    socket.emit('new-user-joined',name)

    // receive a message from the server ie. when server javascript will send the event 'user joined' with arg as data then socket.on will listen that and perfome this arrow function will be performed(Note: we havent given brackets to "data" but it is an arrow function) 
    socket.on('user-joined', (userNameArrayGot,userIdArrayGot,onlineUserNoGot)=>{
        userNameArray=userNameArrayGot
        userIdArray=userIdArrayGot
        onlineUserNo=onlineUserNoGot
        // onlineUserNo=myOnlineUserNoGot
        append(`${userNameArray[onlineUserNo]} joined the chat`,'center','join-left')
        onlineListAppend(userNameArray[onlineUserNo],userIdArray,onlineUserNo)
    })
    
    socket.on('currentOnlineUsers', (userNameArrayGot,userIdArrayGot,onlineUserNoGot)=>{
        userNameArray=userNameArrayGot
        userIdArray=userIdArrayGot
        onlineUserNo=onlineUserNoGot
        myOnlineUserNo=onlineUserNoGot
        onlineListAppendAll()
    })
    
    socket.on('recieve', data=>{
        append(data,'left','message')
    })
    
    socket.on('user-left', (onlineUserLeftNo)=>{
        append(`${userNameArray[onlineUserLeftNo]} left the chat`, 'center','join-left')
        onlineRemove(onlineUserLeftNo)
    })
}