let testCtx = document.createElement('canvas').getContext('2d')

function updateCanvas() {
    // window.fetch('http://localhost:3090/data')
    window.fetch('http://192.168.86.42:3090/data')
    .then((res) => res.text())
    .then((res) => {
        let pixelData = res.split('|')[0].split(',').map(Number)
        let remoteWidth = res.split('|')[1]
        let remoteHeight = res.split('|')[2]
        testCtx.canvas.width = remoteWidth
        testCtx.canvas.height = remoteHeight

        let imageData = testCtx.createImageData(remoteWidth, remoteHeight)

        for (let i = 0; i < pixelData.length; i += 4) {
            imageData.data[i] = pixelData[i] // Red
            imageData.data[i + 1] = pixelData[i + 1] // Green
            imageData.data[i + 2] = pixelData[i + 2] // Blue
            imageData.data[i + 3] = pixelData[i + 3] // Alpha
        }

        testCtx.putImageData(imageData, 0, 0)
    })
}

// let tCubeGeo = new THREE.BoxGeometry(1, 1, 1)
let tGeo = new THREE.PlaneGeometry(1, 1)
let tTex = new THREE.CanvasTexture(testCtx.canvas)
let tMat = new THREE.MeshBasicMaterial({
    map: tTex,
    transparent: true,
})
let tMesh = new THREE.Mesh(tGeo, tMat)
tMesh.position.set((mapSize / 2) + 1, 2, (mapSize / 2) + 4)
scene.add(tMesh)

setInterval(() => {
    updateCanvas()
    tTex.needsUpdate = true
}, 500)

controls.checkNewX = function(x, z) {
    return !mapData.checkOccupied(Math.round(x), Math.round(z))
}
controls.checkNewZ = function(x, z) {
    return !mapData.checkOccupied(Math.round(x), Math.round(z))
}
