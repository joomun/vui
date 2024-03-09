const express = require('express');
const app = express();
const path = require('path');

// Serve static files from your "vui" directory
// If server.js is in the root and "vui" is also in the root, the path will be as follows:
app.use(express.static(path.join(__dirname, 'vui')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/resources', express.static(path.join(__dirname, 'resources')));

// Body parser to handle JSON payloads
app.use(express.json());

// Endpoint for processing transcripts
app.post('/api/send_transcript', (req, res) => {
    const transcript = req.body.transcript;
    // Here you would add your logic to process the transcript with an NLP API
    // For now, let's just send back a dummy response
    res.json({ reply: "Processed Transcript: " + transcript });
});

// Catch-all handler for any other GET request, not handled by static files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
