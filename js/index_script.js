var recognition;
var isStarted = false;
var audioContext, analyser, microphone, dataArray;

function initAudioContext() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
}

function drawWave() {
    requestAnimationFrame(drawWave);

    analyser.getByteTimeDomainData(dataArray);

    var canvas = document.getElementById("audioWave");
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height;

    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(34, 34, 34)";

    ctx.beginPath();

    var sliceWidth = width * 1.0 / analyser.fftSize;
    var x = 0;

    for (var i = 0; i < analyser.fftSize; i++) {
        var v = dataArray[i] / 128.0;
        var y = v * height / 2;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
}

function toggleRecording() {
    if (isStarted) {
        recognition.stop();
        // Disconnect the microphone from the analyser when not recording
        microphone.disconnect();
        analyser.disconnect();
    } else {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                microphone = audioContext.createMediaStreamSource(stream);
                microphone.connect(analyser);
                drawWave();
                recognition.start();
            }).catch(function(err) {
                console.log('Error occurred when trying to get microphone input: ' + err);
                alert('Could not access the microphone. Error: ' + err);
            });
    }
}

function initSpeechRecognition() {
    if (window.webkitSpeechRecognition) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = function() {
            isStarted = true;
            document.getElementById('mic-icon').classList.add('recording');
            document.getElementById('wave').style.display = 'block'; // Show the canvas when recording
        };

        recognition.onresult = function(event) {
            var transcript = '';
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                transcript += event.results[i][0].transcript;
            }
            document.getElementById('transcript-text').textContent = transcript;
        };

        recognition.onend = function() {
            isStarted = false;
            document.getElementById('mic-icon').classList.remove('recording');
            document.getElementById('wave').style.display = 'none'; // Hide the canvas when not recording
        };

        // Initialize the AudioContext and analyser
        initAudioContext();
    } else {
        alert('Your browser does not support the Web Speech API. Please use Google Chrome for this feature.');
    }
}

window.onload = function() {
    initSpeechRecognition();
};
