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
var chatText = document.getElementById('chat-text')
var chatInput = document.getElementById('chat-input')
var chatForm = document.getElementById('chat-form')

var socket = io()
var typing = false

function addChatMessage(chat) {
  chatText.innerHTML += `<div class="chatCell">${chat.sender}: ${chat.text}</div>`
}

socket.on('chatHistory', function (history) {
  for(var i in history) {
    addChatMessage(history[i])
  }
})

//add a chat cell to our chat list view, and scroll to the bottom
socket.on('addToChat', function (chat) {
  console.log('received a chat message from the server.')
  addChatMessage(chat)
  chatText.scrollTop = chatText.scrollHeight
})

chatForm.onsubmit = function (e) {
  //prevent the form from refreshing the page
  e.preventDefault()
  //call sendMsgToServer socket function, with form text value as argument
  socket.emit('sendMsgToServer', chatInput.value)
  chatInput.value = ""
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('chat-input').addEventListener('focus', function () {
    typing = true
  })
  document.getElementById('chat-input').addEventListener('blur', function () {
    typing = false
  })
})

document.onkeyup = function (event) {
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