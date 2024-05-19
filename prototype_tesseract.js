import { createWorker } from 'tesseract.js';

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
context.font = "30px Arial";
context.strokeText("Hallo du", 50, 50);

const test = await navigator.xr.isSessionSupported()
alert(test)



// Put event listeners into place
window.addEventListener("DOMContentLoaded", function () {
    // Grab elements, create settings, etc.
    var canvas = document.getElementById("canvas"),
    context = canvas.getContext("2d"),
    video = document.getElementById("video"),
    videoObj = { "video": {
        facingMode: 'environment'
      }},
    errBack = function (error) {
        console.log("Video capture error: ", error.code);
    };
    video.onload = () => {
        console.log(video.videoWidth)
        console.log(video.videoHeight)
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
    }
    // Put video listeners into place
    if (navigator.getUserMedia) { // Standard
        navigator.getUserMedia(videoObj, function (stream) {
            video.srcObject = stream;
            video.play();
        }, errBack);
    } else if (navigator.webkitGetUserMedia) { // WebKit-prefixed
        navigator.webkitGetUserMedia(videoObj, function (stream) {
            video.src = window.webkitURL.createObjectURL(stream);
            video.play();
        }, errBack);
    }
    else if (navigator.mozGetUserMedia) { // Firefox-prefixed
        navigator.mozGetUserMedia(videoObj, function (stream) {
            video.src = window.URL.createObjectURL(stream);
            video.play();
        }, errBack);
    }
}, false);
document.getElementById("snap")
.addEventListener("click", function() {

window.requestAnimationFrame(() => read())

});

function read() {
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    (async () => {
        const worker = await createWorker('deu');
        const ret = await worker.recognize(canvas.toDataURL());
        document.getElementById('output').innerHTML = ret.data.text
        console.log(ret.data.text);
        await worker.terminate();
        if (ret.data.text.includes('Stadtrat')) {
            alert('Stadtrat')
        }
        window.requestAnimationFrame(() => read())
      })();
}
