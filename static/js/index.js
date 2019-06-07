var socket = io()

/* 접속 되었을 때 실행 */
socket.on('connect', () => {
  /* 이름을 입력받고 */
  var name = prompt('이름을 입력해주세요!', '')

  /* 이름이 빈칸인 경우 */
  if(!name) {
    name = '익명'
  }

  /* 서버에 새로운 유저가 왔다고 알림 */
  socket.emit('newUser', name)
})

/* 서버로부터 데이터 받은 경우 */
socket.on('update', (data) => {
  var chat = document.getElementById('chat')
  var friend = document.getElementById('friend')
  var message = document.createElement('div')
  var node = document.createTextNode(`${data.name} ${data.message}`)
  var className = ''
  var nameBlock = document.createElement('div')
  var name = document.createTextNode(`${data.name}`)
  nameBlock.appendChild(name)
  // 타입에 따라 적용할 클래스를 다르게 지정
  switch(data.type) {
    case 'message':
      className = 'other'
      nameBlock.classList.add('name')
      chat.appendChild(nameBlock)
      node = document.createTextNode(`${data.message}`)
      break

    case 'connect':
      className = 'connect'
      nameBlock.classList.add('member')
      nameBlock.id=`${data.name}`;
      friend.appendChild(nameBlock);
      break

    case 'disconnect':
      className = 'disconnect'
      friend.removeChild(document.getElementById(`${data.name}`))
      break
  }
  message.classList.add(className)
  message.appendChild(node)
  chat.appendChild(message)
  document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
})

/* 메시지 전송 함수 */
function send() {
  // 입력되어있는 데이터 가져오기
  var message = document.getElementById('test').value
  if(!message)return;
  // 가져왔으니 데이터 빈칸으로 변경
  document.getElementById('test').value = ''
  // 내가 전송할 메시지 클라이언트에게 표시
  var chat = document.getElementById('chat')
  var msg = document.createElement('div')
  var node = document.createTextNode(message)
  msg.classList.add('me')
  msg.appendChild(node)
  chat.appendChild(msg)
  document.getElementById('chat').scrollTop = document.getElementById('chat').scrollHeight;
  // 서버로 message 이벤트 전달 + 데이터와 함께
  socket.emit('message', {type: 'message', message: message})
}
