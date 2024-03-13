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
        .then(function (stream) {
            microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            drawWave();
            recognition.start();
        }).catch(function (err) {
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
            if (data.success) {
                if (data.virtualTourUrl) {
                    window.open(data.virtualTourUrl, '_blank');
                } else if (data.location) {
                    initializeGoogleMapsAPI().then(() => {
                        const destinationCoords = { lat: data.location.Coordinates.lat, lng: data.location.Coordinates.lng };
                        initMapModal(destinationCoords);
                    });
                } else {
                    if (data.reply && data.reply.trim() !== '') {
                        // Speak the bot's response
                        speak(data.reply);
                    }
                    showChatBubble(data.reply, 'bot'); // Continue this for non-location responses
                }
            } else {
                showChatBubble(data.message, 'bot'); // Error message or location not found
            }
        })
        .catch((error) => {
            console.error('API call error:', error);
            showChatBubble('There was an error processing your request.', 'bot');
        });
}

function speak(message, voiceName) {
    const utterance = new SpeechSynthesisUtterance(message);

    // Get a list of all available voices
    const voices = window.speechSynthesis.getVoices();

    // Find the voice with the specified name
    const selectedVoice = voices.find(voice => voice.name === voiceName);

    // Set the selected voice for the utterance
    utterance.voice = selectedVoice;

    // Speak the message
    speechSynthesis.speak(utterance);
}





function initSpeechRecognition() {
    if (window.webkitSpeechRecognition) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = function () {
            isRecording = true;
            document.getElementById('mic-icon').classList.add('recording');
            document.getElementById('wave').style.display = 'block'; // Show the canvas when recording
        };

        recognition.onresult = function (event) {
            var interimTranscript = '';
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    transcript += event.results[i][0].transcript;
                    showChatBubble(event.results[i][0].transcript, 'user');
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

        recognition.onend = function () {
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

window.onload = function () {
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

function fetchGoogleMapsApiKey() {
    return fetch('/api/maps-api-key', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

        .then(response => {
            if (!response.ok) {
                // It's good practice to include the status in the error for more context
                throw new Error(`Network response was not ok, status was: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data.mapapiKey) {
                // Handle the case where the API key is undefined or not sent properly
                throw new Error('API key was not found in the response');
            }
            return data.mapapiKey;
        })
        .catch(error => {
            console.error("Failed to fetch Google Maps API key:", error);
            // You might want to handle this error in the UI by showing a message to the user
            // For instance, by returning a promise rejection with the error message
            return Promise.reject(error.message);
        });
}



function initMapModal(destinationCoords) {
    // Display the modal
    document.getElementById('mapModal').style.display = 'block';

    // Initialize the map
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: destinationCoords // This will be updated once directions are loaded
    });

    var directionsService = new google.maps.DirectionsService();
    var directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    // Close modal handler
    document.getElementById('closeModal').onclick = function () {
        document.getElementById('mapModal').style.display = 'none';
    };

    // Check if Geolocation is supported
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            // Calculate and display the route
            calculateAndDisplayRoute(directionsService, directionsRenderer, userLocation, destinationCoords);
        }, function () {
            handleLocationError(true, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, map.getCenter());
    }
}

function calculateAndDisplayRoute(directionsService, directionsRenderer, start, end) {
    directionsService.route({
        origin: start,
        destination: end,
        // Consider allowing the user to select the mode
        travelMode: google.maps.TravelMode.DRIVING,
    }, function (response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

function handleLocationError(browserHasGeolocation, pos) {
    console.error(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    // Consider providing further instructions to the user or a fallback
}


function initializeGoogleMapsAPI() {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve();
            return;
        }

        fetchGoogleMapsApiKey().then(apiKey => {
            if (!apiKey) {
                reject('No API key received.');
                return;
            }
            loadGoogleMapsScript(apiKey).then(resolve).catch(reject);
        });
    });
}

function loadGoogleMapsScript(apiKey) {
    if (window.google && window.google.maps) {
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        script.onload = resolve;
        script.onerror = () => {
            reject(new Error('Failed to load Google Maps script.'));
        };
    });
}



window.onload = function () {
    initSpeechRecognition();
};