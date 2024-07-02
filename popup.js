let isRecording = false;
let mediaRecorder;
let recordedChunks = [];

const recordButton = document.getElementById('recordButton');
const playButton = document.getElementById('playButton');
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
const handleAudioStop = (blob) => {
    blobToBase64(blob).then(base64String => {
        console.log(base64String); // Logs base64 encoded string

        const formData = { audio: base64String };
        fetch('http://localhost:3020/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Set the Content-Type header
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(transcription => {
                console.log('Transcription:', transcription);
                // Handle transcription as needed
            })
            .catch(error => console.error('Error:', error));
    });
};
recordButton.addEventListener('click', async () => {
    if (isRecording) {
        mediaRecorder.stop();
        recordButton.textContent = 'Start Recording';
        playButton.disabled = false;
        isRecording = false;
    } else {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm; codecs=opus' });
            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };
            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'audio/webm; codecs=opus' });
                recordedChunks = [];
                const audioURL = URL.createObjectURL(blob);
                playButton.dataset.audioUrl = audioURL;
                handleAudioStop(blob);
            };
            mediaRecorder.start();
            recordButton.textContent = 'Stop Recording';
            playButton.disabled = true;
            isRecording = true;
        } catch (error) {
            console.error('Error accessing the microphone:', error);
            alert('Permission to access the microphone was denied. Please allow microphone access.');
        }
    }
});

playButton.addEventListener('click', () => {
    const audioURL = playButton.dataset.audioUrl;
    const audio = new Audio(audioURL);
    audio.play();
});
