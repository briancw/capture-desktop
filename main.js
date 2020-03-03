const {app, BrowserWindow} = require('electron')
const express = require('express')
const path = require('path')
const webApp = express()

webApp.use('/', express.static(path.resolve(__dirname)))

webApp.listen(3091)

function createWindow() {
    // Create the browser window.
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    })

    // and load the index.html of the app.
    win.loadFile('index.html')
}

app.whenReady().then(createWindow)
