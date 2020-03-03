/* eslint-disable require-jsdoc */
const {desktopCapturer} = require('electron')

const {Readable} = require('stream')
// const zlib = require('zlib')
const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')
// const compress = zlib.createBrotliCompress()

const privateKey = fs.readFileSync(path.resolve(__dirname, '../colony-sim-vr/server/certs/localcert.key'), 'utf8')
const certificate = fs.readFileSync(path.resolve(__dirname, '../colony-sim-vr/server/certs/localcert.crt'), 'utf8')
const credentials = {key: privateKey, cert: certificate}

let imageData = ''
let width = 0
let height = 0
let ready = false

// const server = https.createServer(credentials, function(req, res) {
const server = http.createServer(function(req, res) {
    if (ready) {
        if (req.url === '/data') {
            res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Request-Method': '*',
                'Content-Type': 'text/plain',
                // 'Content-Type': 'application/octet-stream',
                // 'Content-Disposition': 'attachment; filename="myfile.txt"',
                // 'Content-Encoding': 'br',
            })

            let payload = imageData.data.join(',') + '|' + width + '|' + height
            let readable = Readable.from([payload])
            readable.on('data', (chunk) => {
                res.write(chunk)
            })
            readable.on('end', () => {
                res.end()
            })
        }
    } else {
        res.writeHead(200)
        res.write('not ready')
        res.end()
    }
})

server.listen(3090)

desktopCapturer.getSources({types: ['window', 'screen']}).then(async (sources) => {
    console.log(sources)
    for (const source of sources) {
        // if (source.name === 'Entire Screen') {
        if (source.id === 'window:5719:0') {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: false,
                    video: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            chromeMediaSourceId: source.id,
                            minWidth: 0,
                            minHeight: 0,
                            maxWidth: 2560,
                            maxHeight: 1440,
                            // maxWidth: 640,
                            // maxHeight: 360,
                        },
                    },
                })
                handleStream(stream)
            } catch (e) {
                handleError(e)
            }
            return
        }
    }
})

function handleStream(stream) {
    const video = document.querySelector('video')
    video.srcObject = stream
    video.onloadedmetadata = function() {
        video.play()

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        width = this.videoWidth / 2
        height = this.videoHeight / 2

        canvas.width = width
        canvas.height = height
        canvas.style = 'position: absolute; top: 0px; left: 0px; width: 100%; height: 100%;'

        document.body.append(canvas)
        ready = true

        setInterval(() => {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        }, 100)
        setInterval(() => {
            imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        }, 200)
    }
}

// function handleStream(stream) {
//     console.log('stream started')
//     const video = document.querySelector('video')
//     video.srcObject = stream
//     video.onloadedmetadata = (e) => video.play()
// }

function handleError(e) {
    console.log(e)
}
