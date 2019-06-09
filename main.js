const { app, BrowserWindow } = require('electron')
require('./app.js')

const path =require('path')
const url =require('url')
let win = null
function createWindow () {
  // 브라우저 창을 생성
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nativeWindowOpen: true,
      nodeIntegration: true
    }
  })
  win.loadURL('http://localhost:8080')
  win.on('closed', () => {
    win = null
  })
}
app.once('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})