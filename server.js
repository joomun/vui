require('dotenv').config();
const { OpenAI } = require('openai');

const openai = new OpenAI(process.env.OPENAI_API_KEY);

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
app.post('/api/send_transcript', async (req, res) => {
    const userTranscript = req.body.transcript;
    try {
        const chatCompletion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an AI assistant knowledgeable about Middlesex University Mauritius Campus.'
                },
                {
                    role: 'user',
                    content: userTranscript
                }
            ],
        });

        console.log('OpenAI API response:', chatCompletion);

        // Validate if the necessary properties exist in the response
        if (chatCompletion && chatCompletion.choices && chatCompletion.choices.length > 0 && chatCompletion.choices[0].hasOwnProperty('message')) {
            const message = chatCompletion.choices[0].message; // Directly access the message object

            // Use the 'content' property instead of 'text'
            if (message.hasOwnProperty('content')) {
                const reply = message.content.trim();
                res.json({ success: true, reply });
            } else {
                console.error('Message object lacks expected "content" property:', message);
                res.status(500).json({ success: false, error: 'Message object lacks expected "content" property' });
            }
        } else {
            console.error('Invalid or unexpected response from OpenAI API:', chatCompletion);
            res.status(500).json({ success: false, error: 'Invalid or unexpected response from OpenAI API' });
        }
    } catch (error) {
        console.error('Error with OpenAI API:', error);
        // In case of an error, ensure 'chatCompletion' is defined before attempting to log 'message'
        if (chatCompletion && chatCompletion.choices && chatCompletion.choices.length > 0) {
            console.log('Message object at error:', chatCompletion.choices[0].message);
        }
        res.status(500).json({ success: false, error: 'Error with OpenAI API' });
    }
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
