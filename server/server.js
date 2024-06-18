// server.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const speech = require('@google-cloud/speech');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Replace 'YOUR_PROJECT_ID' with your Google Cloud project ID
const client = new speech.SpeechClient({ projectId: 'chrvspeech', keyFilename: './chrvspeech-1c4535b115f0.json' });

app.use(cors()); // Enable CORS for all requests

app.post('/upload', upload.single('audio'), (req, res) => {
    console.log('test', req.file)
    const file = req.file;

    if (!file) {
        return res.status(400).send('No audio file uploaded.');
    }

    const audioBytes = fs.readFileSync(file.path).toString('base64');
    const audio = { content: audioBytes };

    const config = {
        encoding: 'audio/ogg',
        languageCode: 'en-US',
    };
    console.log('audioBytes', audioBytes);
    const request = { audio: audio, config: config };

    client.recognize(request)
        .then(response => {
            console.log(response)
            const transcription = response[0].results
                .map(result => result.alternatives[0].transcript)
                .join('\n');
            res.send(transcription);
        })
        .catch(err => {
            console.error('ERROR:', err);
            res.status(500).send('Error processing speech-to-text.');
        });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});