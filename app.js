/* 설치한 express 모듈 불러오기 */
const express = require('express')

/* 설치한 socket.io 모듈 불러오기 */
const socket = require('socket.io')

/* Node.js 기본 내장 모듈 불러오기 */
const http = require('http')

/* Node.js 기본 내장 모듈 불러오기 */
const fs = require('fs')

/* express 객체 생성 */
const app = express()

/* express http 서버 생성 */
const server = http.createServer(app)

/* 생성된 서버를 socket.io에 바인딩 */
const io = socket(server)

//views 파일안의 html 파일들 렌더링(불러오기)준비
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

//클라이언트의 POST 요청 받기위해 모듈 불러오기
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false}));
//DB불러오기
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  post: 3306,//오류생기면 추가
  password: 'hsy4080408',
  database: 'minchat_user'
});
connection.connect(function(err){
  if(err){
    console.error('error connection: '+ err.stack);
    return;
  }
  //connection 성공!
  console.log('Success DB connection');
})

app.use('/css', express.static('./static/css'))
app.use('/js', express.static('./static/js'))

/* Get 방식으로 / 경로에 접속하면 실행 됨 */
app.get('/', function(req, res) {
  res.render('login.html', { alert: false});
  // fs.readFile('./views/login.html', function(err, data) {
  //   if(err) {
  //     res.send('에러')
  //   } else {
  //     res.writeHead(200, {'Content-Type':'text/html'})
  //     res.write(data)
  //     res.end()
  //   }
  // })
})
/* 이미지 불러오기*/
app.get('/mintimg', function(req, res){
  fs.readFile('./views/mint.png', function(err, data) {
    if(err) {
      res.send('에러')
    } else {
      res.writeHead(200, {'Content-Type':'text/html'})
      res.end(data)
    }
  })
})

/* 이미지 불러오기*/
app.get('/mint_simg', function(req, res){
  fs.readFile('./views/mint_s.png', function(err, data) {
    if(err) {
      res.send('에러')
    } else {
      res.writeHead(200, {'Content-Type':'text/html'})
      res.end(data)
    }
  })
})
// 로그인정보와 DB정보 확인해서 채팅창 연결
app.post('/', function (req, res){
  var name = req.body.name;
  var pwd = req.body.pwd;
  console.log(name,pwd);
  //DB에 Query전송
  var sql = `SELECT * FROM user_info WHERE username = ?`; 

  connection.query(sql,[name],function(err,results,fields){
    // console.log(results);
    if(results.length == 0){
      res.render('login.html',{ alert: true});
    }
    else{
      var db_pwd = results[0].password;

      if(pwd == db_pwd){
        res.render('index.html');
      }
      else{
        res.render('login.html', { alert: true});
      }
    }
  })
});

//회원가입창 열기
app.get('/register', function (req, res) {
  res.render('register.html',{ alert: false});
});

//일단 index들어가서 디자인 바꿔야되니 로그인정보 확인X
// app.get('/index', function(req, res){
//   fs.readFile('./views/index.html',function(error, data){
//     res.writeHead(200, { 'Content-Type': 'text/html'});
//     res.end(data);
//   })
// })

//회원가입정보 DB에 저장하기
app.post('/register', function (req, res){
  var name = req.body.name;//name의 속성 
  var pwd = req.body.pwd;//name의 속성
  var pwdconf = req.body.pwdconf;//name의 속성
  var nameconf = `SELECT * FROM user_info WHERE username = ?`;
  
  //DB에 Query 날리기
  if(nameconf == true){
    var sql = `INSERT INTO user_info VALUES (?,?)`; 
    connection.query(sql, [name,pwd],function(error,results, fields){
      console.log(results);
      res.redirect('/');
    });
  }
  else{
    res.render('register.html', { alert: true});
  }
});

io.sockets.on('connection', function(socket) {

  socket.on('rooms',function(){
    socket.emit('rooms',io.sockets.manager.rooms);
  })
  /* 새로운 유저가 접속했을 경우 다른 소켓에게도 알려줌 */
  socket.on('newUser', function(name) {
    console.log(name + ' 님이 접속하였습니다.')
    /* 소켓에 이름 저장해두기 */
    socket.name = name;
    /* 모든 소켓에게 전송 */
    io.sockets.emit('update', {type: 'connect', name: name, message: '님이 접속하였습니다.'})
  })

  /* 전송한 메시지 받기 */
  socket.on('message', function(data) {
    /* 받은 데이터에 누가 보냈는지 이름을 추가 */
    data.name = socket.name
    
    console.log(data)

    /* 보낸 사람을 제외한 나머지 유저에게 메시지 전송 */
    socket.broadcast.emit('update', data);
  })

  /* 접속 종료 */
  socket.on('disconnect', function() {
    console.log(socket.name + '님이 나가셨습니다.')
    var tempName = socket.name;
    /* 나가는 사람을 제외한 나머지 유저에게 메시지 전송 */
    socket.broadcast.emit('update', {type: 'disconnect', name: tempName, message: '님이 나가셨습니다.'});
  })
})

/* 서버를 8080 포트로 listen */
server.listen(8080, function() {
  console.log('서버 실행 중..')
})

