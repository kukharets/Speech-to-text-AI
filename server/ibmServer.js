require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { IamAuthenticator } = require('ibm-watson/auth');
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const multer = require('multer');

const app = express();
const upload = multer();

const speechToText = new SpeechToTextV1({
    authenticator: new IamAuthenticator({
        apikey: process.env.IBM_API_KEY,
    }),
    serviceUrl: process.env.IBM_URL,
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/upload', async (req, res) => {
    const base64Audio = req.body.audio;

    if (!base64Audio) {
        return res.status(400).send('No audio file uploaded.');
    }

    try {
        const buffer = Buffer.from(base64Audio, 'base64');
        const audio = buffer;

        const params = {
            audio: audio,
            contentType: 'audio/webm',
            model: 'en-US_BroadbandModel', // Ви можете змінити модель відповідно до ваших потреб
        };

        const response = await speechToText.recognize(params);
        const transcription = response.result.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
        res.json({ transcription });
    } catch (err) {
        console.error('ERROR:', err);
        res.status(500).send('Error processing speech-to-text.');
    }
});

app.get('/process-file', async (req, res) => {
    const filePath = path.join(__dirname, '../harvard_mono.wav'); // Вкажіть свій файл

    try {
        const audioFile = fs.createReadStream(filePath);

        const params = {
            audio: audioFile,
            contentType: 'audio/wav',
            model: 'en-US_BroadbandModel',
        };

        const response = await speechToText.recognize(params);
        const transcription = response.result.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
        res.json({ transcription });
    } catch (err) {
        console.error('ERROR:', err);
        res.status(500).send('Error processing speech-to-text.');
    }
});

app.post('/stream', upload.single('audio'), async (req, res) => {
    const buffer = req.file.buffer;

    if (!buffer) {
        return res.status(400).send('No audio file uploaded.');
    }

    try {
        const params = {
            audio: buffer,
            contentType: 'audio/webm', // Змініть на відповідний тип контенту
            model: 'en-US_BroadbandModel',
        };

        const response = await speechToText.recognize(params);
        const transcription = response.result.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
        res.json({ transcription });
    } catch (err) {
        console.error('ERROR:', err);
        res.status(500).send('Error processing speech-to-text.');
    }
});

const PORT = process.env.SERVER_PORT_IBM || 3020;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
