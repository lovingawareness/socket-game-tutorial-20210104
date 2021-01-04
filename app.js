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
const e = require('cors')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
var PORT = 4141

var clients = {}
var chatHistory = [] // make this a queue of 100 items, perhaps? 

app.use('/', express.static(__dirname + '/client'))

io.sockets.on('connection', (socket) => {
  clients[socket.id] = socket
  var chat = {
    'type': 'status',
    'sender': null,
    'text': `${socket.id} has joined.`
  }
  console.log(`${socket.id} has joined.`)
  chatHistory.push(chat)
  for(var id in clients) {
    if(id === socket.id) {
      // Send the client the current chat history to catch up
      socket.emit('chatHistory', chatHistory)
    } else {
      // Send everyone else just the latest message
      clients[id].emit('addToChat', chat)
    }
  }

  socket.on('sendMsgToServer', (message) => {
    var chat = {'type': 'message', 'sender': socket.id, 'text': message}

    console.log(`${chat.sender} sent a message: ${chat.text}`)
    chatHistory.push(chat)
    for(var id in clients) {
      clients[id].emit('addToChat', chat)
    }
  })

  socket.on('disconnect', () => {
    delete clients[socket.id]
  })
})

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`)
})