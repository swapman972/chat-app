const io = require('./index.js').io

const { VERIFY_USER, USER_CONNECTED, LOGOUT, 
    USER_DISCONNECTED, COMMUNITY_CHAT, MESSAGE_RECEIVED, MESSAGE_SENT, TYPING} = require('../Events')

const { createUser, createMessage, createChat } = require('../Factories')

let connectedUsers = { }

let communityChat = createChat()

module.exports = function(socket){
    console.log('Socket Id' + socket.id) 

    let sendMessageToChatFromUser

    let sendTypingFromUser

    //Verify Username
    socket.on(VERIFY_USER, (nickname, callback)=>{
        if(isUser(connectedUsers, nickname)){
            callback({ isUser: true, user: null})
        }else {
            callback({ isUser:false, user:createUser({name:nickname})})
        }
    })

    //user connects with username
    socket.on(USER_CONNECTED, (user)=>{
        connectedUsers = addUser(connectedUsers,user)
        socket.user = user

        sendMessageToChatFromUser = sendMessageToChat(user.name)
        sendTypingFromUser = sendTypingToChat(user.name)
        io.emit(USER_CONNECTED, connectedUsers)
    })

    //User disconnects
    socket.on('disconnect', () =>{
        if('user' in socket){
            connectedUsers = removeUser(connectedUsers, socket.user.name)

            io.emit(USER_DISCONNECTED, connectedUsers)
            // console.log('Disconnect', connectedUsers)
        }
    })

    //User logs out
    socket.on(LOGOUT, ()=>{
        connectedUsers = removeUser(connectedUsers, socket.user.name)
        io.emit(USER_DISCONNECTED, connectedUsers)
        console.log('bye, remaining user:', connectedUsers)
    })

    //Get Community Chat
    socket.on(COMMUNITY_CHAT, (callback)=>{
        callback(communityChat)
    })

    socket.on(MESSAGE_SENT, ({chatId, message})=>{
        sendMessageToChatFromUser(chatId, message)
    })

    //typing feature
    socket.on(TYPING, ({chatId, isTyping})=> {
        sendTypingFromUser(chatId, isTyping)
    })

}

function sendTypingToChat(user){
    return (chatId, isTyping)=>{
        io.emit(`${TYPING}-${chatId}`, {user, isTyping})
    }
}

function sendMessageToChat(sender){
    return(chatId, message)=>{
        io.emit(`${MESSAGE_RECEIVED}-${chatId}`, createMessage({message, sender}))
    }
}

function addUser(userList, user){
    let newList = Object.assign({}, userList)
    newList[user.name] = user
    return newList
}

function removeUser(userList, username){
    let newList = Object.assign({}, userList)
    delete newList[username]
    return newList
}

function isUser(userList, username){
    return username in userList
}