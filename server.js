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


// Load the international fees data
const internationalFeesData = require('./js/custom_response/international.json').InternationalFees;

// Endpoint for processing transcripts


app.post('/api/send_transcript', async (req, res) => {
    const userTranscript = req.body.transcript;

    if (isAskingAboutInternationalFees(userTranscript)) {
        // Extract the program name from the transcript
        const programName = getProgramNameFromTranscript(userTranscript, internationalFeesData);

        if (programName) {
            // Find the tuition fees for the specified program
            const programFees = internationalFeesData.find(p => p.Program.toLowerCase() === programName.toLowerCase());
            
            if (programFees) {
                const reply = createTuitionFeesResponse(programFees);
                res.json({ success: true, reply });
            } else {
                res.json({ success: false, message: "I'm sorry, I couldn't find the fees for that program." });
            }
        } else {
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
        }
    } else {
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
    }
});

function isAskingAboutInternationalFees(transcript) {
    // Simple keyword check
    const keywords = ['international fees', 'tuition cost', 'price of', 'how much for','fees'];
    return keywords.some(keyword => transcript.toLowerCase().includes(keyword));
}

function getProgramNameFromTranscript(transcript, feesData) {
    // Log to verify the data is loaded correctly
    console.log(feesData);

    // Ensure the variable is an array before calling .find
    if (Array.isArray(feesData)) {
        // Log the array status
        console.log("feesData is an array, proceeding with the program name extraction.");

        // Map through the feesData to get all program names in lowercase for comparison
        const programNames = feesData.map(fee => fee.Program.toLowerCase());
        console.log(programNames); // Log the lowercased program names for debugging

        // Find the first program name that is included in the user's transcript
        // Here, we assume the transcript includes the full program name
        const foundProgramName = programNames.find(programName => transcript.toLowerCase().includes(programName));
        
        // If a program name is found, return the original (case-sensitive) program name from feesData
        if (foundProgramName) {
            const foundProgram = feesData.find(p => p.Program.toLowerCase() === foundProgramName);
            return foundProgram ? foundProgram.Program : null;
        } else {
            // No program name was found in the transcript
            return null;
        }
    } else {
        // If this logs, feesData is not an array, which is an error
        console.error("feesData is not an array");
        return null;
    }
}


function createTuitionFeesResponse(feesInfo) {
    // Create a human-readable response message with the fees information
    return `The tuition fee for the ${feesInfo.Program} program is ${feesInfo.TuitionFees}, ` +
           `plus ${feesInfo.AdminFees} in admin fees. The full payment amount is ${feesInfo.FullPayment}, ` +
           `with an installment plan option available requiring a non-refundable deposit of ${feesInfo.InstallmentNonRefundableDeposit} ` +
           `followed by installments of ${feesInfo.Installment.join(' and ')}.`;
}

// Catch-all handler for any other GET request, not handled by static files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'html/index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
