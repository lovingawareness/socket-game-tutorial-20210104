/**
 * 
 * From 
 * https://www.skysilk.com/blog/2018/online-javascript-game-tutorial/
 * 
 * built on code from 
 * 
 * https://www.skysilk.com/blog/2018/create-real-time-chat-app-nodejs/
 * 
 */
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
var PORT = 4141

var clients = {}
var chatHistory = [] // make this a queue of 100 items, perhaps? 

app.use('/', express.static(__dirname + '/client'))

function broadcastChat(chat) {
  for (var id in clients) {
    clients[id].emit('addToChat', chat)
  }
}

io.sockets.on('connection', (socket) => {
  clients[socket.id] = socket
  var chat = {
    'type': 'status',
    'sender': null,
    'text': `${socket.id} has joined.`
  }
  console.log(`${socket.id} has joined.`)
  chatHistory.push(chat)
  broadcastChat(chat)
  // Send the client the current chat history to catch up
  socket.emit('chatHistory', chatHistory)


  socket.on('sendMsgToServer', (message) => {
    var chat = {'type': 'message', 'sender': socket.id, 'text': message}

    console.log(`${chat.sender} sent a message: ${chat.message}`)
    chatHistory.push(chat)
    broadcastChat(chat)
  })

  socket.on('disconnect', () => {
    delete clients[socket.id]
  })
})

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`)
})