let isRecording = false;
let mediaRecorder;
let recordedChunks = [];

const recordButton = document.getElementById('recordButton');
const playButton = document.getElementById('playButton');

const handleAudioStop = (recordedAudioBlob) => {
    const formData = new FormData();
    formData.append('audio', recordedAudioBlob, 'recording.webm');

    fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
    })
        .then(response => response.text())
        .then(transcription => {
            console.log('Transcription:', transcription);
            // Handle transcription as needed
        })
        .catch(error => console.error('Error:', error));
}
recordButton.addEventListener('click', async () => {
    console.log('op')
    if (isRecording) {
        // Stop recording
        mediaRecorder.stop();
        recordButton.textContent = 'Start Recording';
        playButton.disabled = false;
        isRecording = false;
    } else {
        try {
            // Request permission and start recording
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };
            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, {
                    type: 'audio/ogg'
                });
                handleAudioStop(blob)
                recordedChunks = [];
                const audioURL = URL.createObjectURL(blob);
                playButton.dataset.audioUrl = audioURL;
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