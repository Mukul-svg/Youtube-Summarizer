document.getElementById('fetchTranscript').addEventListener('click', async () => {
    const videoUrl = document.getElementById('videoUrl').value;
    const videoId = getVideoId(videoUrl);
    const transcriptDiv = document.getElementById('transcript');

    if (!videoId) {
        transcriptDiv.innerHTML = 'Please enter a valid YouTube video URL.';
        return;
    }

    transcriptDiv.innerHTML = 'Summarizing...'; // Display loading message

    try {
        const response = await fetch('https://youtube-summarizer-eight.vercel.app/api/transcript', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ videoId }) // Send video ID to server
        });

        if (!response.ok) {
            throw new Error('Failed to fetch transcript.');
        }

        const data = await response.json();
        const summary = data.summary;

        transcriptDiv.innerHTML = ''; // Clear previous content
        const p = document.createElement('p');
        p.textContent = summary; // Display the summary
        transcriptDiv.appendChild(p);

    } catch (error) {
        console.error('Error fetching transcript:', error);
        transcriptDiv.innerHTML = 'Failed to fetch transcript. Please try again later.';
    }
});

function getVideoId(url) {
    const regex = /[?&]v=([^&#]*)/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
}
