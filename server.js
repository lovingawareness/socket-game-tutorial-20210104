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
const pino = require('pino')()
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const PORT = 4141
const resetInterval = 60*1000

var chatStartTime = Date.now()
var chatEndTime = chatStartTime + resetInterval

var clients = {}
var chatHistory = [] // make this a queue of 100 items, perhaps? 

var resetCount = 0

app.use('/', express.static(__dirname + '/client'))

function broadcastStatus(message) {
  var chat = {
    'type': 'status',
    'sender': null,
    'text': message,
    'time': Date.now()
  }
  for(var id in clients) {
    clients[id].emit('addToChat', chat)
  }
  chatHistory.push(chat)
  pino.info(chat)
}

function broadcastMessage(senderId, message) {
  var chat = {
    'type': 'message', 
    'sender': senderId, 
    'text': message,
    'time': Date.now()
  }
  for(var id in clients) {
    clients[id].emit('addToChat', chat)
  }
  chatHistory.push(chat)
  pino.info(chat)
}

io.sockets.on('connection', (socket) => {
  clients[socket.id] = socket
  broadcastStatus(`${socket.id} has joined.`)
  clients[socket.id].emit('chatHistory', 
    {
      'history': chatHistory, 
      'chatStartTime': chatStartTime,
      'chatEndTime': chatEndTime
    }
  )

  socket.on('sendMsgToServer', (message) => {
    if(socket.id in clients) {
      broadcastMessage(socket.id, message)
    } else {
      pino.error(`${socket.id} is trying to send a message ("${message}") but is not a recognized client.`)
    }
  })

  socket.on('disconnect', () => {
    delete clients[socket.id]
    broadcastStatus(`${socket.id} has departed.`)
    pino.info(`received a disconnect signal for ${socket.id}`)
  })
})

server.listen(PORT, () => {
  pino.info(`Server listening on ${PORT}`)
})

io.sockets.emit('chatReset')
setInterval(function() {
  resetCount++
  chatStartTime = Date.now()
  chatEndTime = chatStartTime + resetInterval
  chatHistory = [{
    'type': 'status',
    'sender': null,
    'text': `Reset count ${resetCount}`,
    'time': Date.now()
  }]
  for(var id in clients) {
    clients[id].emit('chatReset', 
      {
        'history': chatHistory,
        'chatStartTime': chatStartTime,
        'chatEndTime': chatEndTime
      }
    )
  }
  pino.info(`Cleared chat`)
}, resetInterval)
