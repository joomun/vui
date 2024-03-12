var recognition;
var isRecording = false;
var audioContext, analyser, microphone, dataArray;
var transcript = '';

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

    ctx.clearRect(0, 0, width, height);

    // Set up the style for the waveform
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgb(34, 34, 34)";

    // Begin the path for the waveform
    ctx.beginPath();

    var sliceWidth = width * 1.0 / analyser.fftSize;
    var x = 0;

    // Loop through the data array and draw the waveform
    for (var i = 0; i < analyser.fftSize; i++) {
        // Normalize the data to [-1, 1] and scale it to the canvas height
        var v = (dataArray[i] / 128.0) - 1;
        var y = (v * height / 0.5) + (height / 4); // Adjust the height / 4 to increase amplitude

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    // Draw the waveform to the canvas
    ctx.lineTo(width, height / 2);
    ctx.stroke();
}



function toggleRecording() {
    if (!isRecording) {
        transcript = ''; // Reset transcript only when starting a new recording
        startRecording();
    } else {
        stopRecording();
    }
}


function startRecording() {
    transcript = ''; // Reset transcript
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


function stopRecording() {
    recognition.stop();
    // Disconnect the microphone from the analyser when not recording
    microphone.disconnect();
    analyser.disconnect();
}


function sendTranscriptToServer(transcript) {
    fetch('/api/send_transcript', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: transcript }),
    })
    .then(response => response.json())
    .then(data => {
        showChatBubble(data.reply,'bot'); // Show the custom response in the chat bubble
    })
    .catch((error) => {
        console.error('API call error:', error);
    });
}

function initSpeechRecognition() {
    if (window.webkitSpeechRecognition) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = function() {
            isRecording = true;
            document.getElementById('mic-icon').classList.add('recording');
            document.getElementById('wave').style.display = 'block'; // Show the canvas when recording
        };

        recognition.onresult = function(event) {
            var interimTranscript = '';
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    transcript += event.results[i][0].transcript;
                    showChatBubble(event.results[i][0].transcript,'user');
                    sendTranscriptToServer(event.results[i][0].transcript);
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                transcript += event.results[i][0].transcript;
            }
            document.getElementById('transcript-text').textContent = interimTranscript;

        };

        recognition.onend = function() {
            isRecording = false;
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






function showChatBubble(message, sender) {
    var chatBubbleContainer = document.getElementById('chat-bubble-container');
    var chatBubble = document.createElement('div');
    chatBubble.classList.add('chat-bubble');
    if (sender === 'user') {
        chatBubble.classList.add('user');
    } else if (sender === 'bot') {
        chatBubble.classList.add('bot');
    }
    chatBubble.textContent = message;
    chatBubbleContainer.appendChild(chatBubble);
    chatBubble.scrollIntoView({ behavior: 'smooth' });
}




window.onload = function() {
    initSpeechRecognition();
};