document.getElementById('fetchTranscript').addEventListener('click', async () => {
    const videoUrl = document.getElementById('videoUrl').value;
    const videoId = getVideoId(videoUrl);
    const transcriptDiv = document.getElementById('transcript');

    if (!videoId) {
        transcriptDiv.innerHTML = 'Please enter a valid YouTube video URL.';
        return;
    }

    const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // Using CORS Anywhere
    const apiUrl = `https://youtube-transcripts.p.rapidapi.com/youtube/transcript?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${videoId}`;
    const finalUrl = `${proxyUrl}${apiUrl}`;

    try {
        const response = await fetch(finalUrl, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': '6e013b5cb6msh4f54dcf1f64757bp1f2ed6jsn05c1e2e921a2', // Replace with your actual RapidAPI key
                'x-rapidapi-host': 'youtube-transcripts.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const resultText = await response.text(); // Get the raw response text
        try {
            const result = JSON.parse(resultText); // Attempt to parse the response as JSON
            const transcript = getFullTranscript(result); // Get the transcript text
            await fetchSummary(transcript); // Send transcript to summarize API
        } catch (jsonError) {
            console.error('Error parsing JSON:', jsonError);
            transcriptDiv.innerHTML = 'Failed to parse transcript data.';
        }
    } catch (error) {
        console.error('Error:', error);
        transcriptDiv.innerHTML = 'Failed to fetch transcript. Please try again later.';
    }
});

function getVideoId(url) {
    const regex = /[?&]v=([^&#]*)/;
    const matches = url.match(regex);
    return matches ? matches[1] : null;
}

// Function to convert the transcript content into a single text block
function getFullTranscript(transcript) {
    const content = transcript.content;
    let fullText = '';

    if (Array.isArray(content)) {
        content.forEach(item => {
            fullText += item.text + ' '; // Append all transcript text into one string
        });
    } else {
        return 'No transcript available.';
    }

    return fullText;
}

// Function to send the transcript to the summary API
async function fetchSummary(transcriptText) {
    const transcriptDiv = document.getElementById('transcript');
    transcriptDiv.innerHTML = 'Summarizing transcript...'; // Display loading message

    try {
        const response = await fetch('http://127.0.0.1:3000/api/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: transcriptText }) // Send transcript text
        });

        if (!response.ok) {
            throw new Error('Failed to generate summary.');
        }

        const data = await response.json();
        const summary = data.summary;

        transcriptDiv.innerHTML = ''; // Clear previous content
        const p = document.createElement('p');
        p.textContent = summary; // Display the summary
        transcriptDiv.appendChild(p);

    } catch (error) {
        console.error('Error summarizing transcript:', error);
        transcriptDiv.innerHTML = 'Failed to summarize transcript.';
    }
}
