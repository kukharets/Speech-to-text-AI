const express = require('express');
const fs = require('fs');
const path = require('path');
const speech = require('@google-cloud/speech');
const cors = require('cors');

const app = express();

// Замініть 'YOUR_PROJECT_ID' вашим Google Cloud project ID
const client = new speech.SpeechClient({ projectId: 'chrvspeech', keyFilename: './chrvspeech-1c4535b115f0.json' });

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Парсити JSON тіла

app.post('/upload', async (req, res) => {
    const base64Audio = req.body.audio;

    if (!base64Audio) {
        return res.status(400).send('No audio file uploaded.');
    }

    try {
        // Декодуйте base64 рядок до бінарних даних
        const buffer = Buffer.from(base64Audio, 'base64');

        // Прочитайте файл як base64 для Google Cloud Speech-to-Text
        const audioBytes = buffer.toString('base64');
        const audio = { content: audioBytes };

        const config = {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: 'en-US',
        };

        const request = { audio: audio, config: config };

        // Виклик Google Cloud Speech-to-Text API
        const [response] = await client.recognize(request);
        const transcription = response.results
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
        // Зчитайте файл з файлової системи
        const audioFile = fs.readFileSync(filePath);
        const audioBytes = audioFile.toString('base64');
        const audio = { content: audioBytes };

        const config = {
            encoding: 'LINEAR16', // Замініть на правильне кодування файлу
            sampleRateHertz: 44100, // Замініть на правильну частоту дискретизації файлу
            languageCode: 'en-US',
        };

        const request = { audio: audio, config: config };

        // Виклик Google Cloud Speech-to-Text API
        const [response] = await client.recognize(request);
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
        res.json({ transcription });
    } catch (err) {
        console.error('ERROR:', err);
        res.status(500).send('Error processing speech-to-text.');
    }
});

const PORT = process.env.SERVER_PORT_GOOGLE || 3010;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
