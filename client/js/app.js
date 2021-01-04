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
var chatText = document.getElementById('chatText')
var chatInput = document.getElementById('chatInput')
var chatForm = document.getElementById('chatForm')
var socketIdSpan = document.getElementById('socketId')

var socket = io()
var typing = false
var chatId = ''

function addChatMessage(chat) {
  switch(chat.type) {
    case 'message': 
      if(chat.sender === chatId) {
        // It's me!
        chatText.innerHTML += `<div class="chatCell">${chat.sender} (you): ${chat.text}</div>`
      } else {
        chatText.innerHTML += `<div class="chatCell">${chat.sender}: ${chat.text}</div>`
      }
      break;
    case 'status':
      chatText.innerHTML += `<div class="chatCell status">${chat.text}</div>`
      break
  }
}

socket.on('chatHistory', (history) => {
  for(var i in history) {
    addChatMessage(history[i])
  }
  chatId = socket.id
  socketIdSpan.innerHTML = socket.id  
})

//add a chat cell to our chat list view, and scroll to the bottom
socket.on('addToChat', (chat) => {
  console.log('received a chat message from the server.')
  addChatMessage(chat)
  chatText.scrollTop = chatText.scrollHeight
})

chatForm.onsubmit = (event) => {
  //prevent the form from refreshing the page
  event.preventDefault()
  //call sendMsgToServer socket function, with form text value as argument
  socket.emit('sendMsgToServer', chatInput.value)
  chatInput.value = ''
}

document.addEventListener('DOMContentLoaded', () => {
  chatInput.addEventListener('focus', () => {
    typing = true
  })
  chatInput.addEventListener('blur', () => {
    typing = false
  })
})

document.onkeyup = (event) => {
  //user pressed and released enter key
  if (event.key === 'Enter') {
    if (!typing) {
      //user is not already typing, focus our chat text form
      chatInput.focus()
    } else {
      //user sent a message, unfocus our chat form
      chatInput.blur()
    }
  }
}