import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch'; // Use import instead of require
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Endpoint to fetch transcript and summarize it
app.post('/api/transcript', async (req, res) => {
    try {
        const { videoId } = req.body;

        if (!videoId) {
            return res.status(400).json({ error: "Video ID is required in the request body" });
        }

        // Fetch transcript from YouTube
        const apiUrl = `https://youtube-transcripts.p.rapidapi.com/youtube/transcript?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D${videoId}`;
        const finalUrl = `${apiUrl}`;

        const transcriptResponse = await fetch(finalUrl, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': process.env.RAPID_API_KEY,
                'x-rapidapi-host': 'youtube-transcripts.p.rapidapi.com'
            }
        });

        if (!transcriptResponse.ok) {
            throw new Error('Failed to fetch transcript.');
        }

        const transcriptData = await transcriptResponse.json();
        const transcript = getFullTranscript(transcriptData);

        // Summarize the transcript
        const summary = await fetchSummary(transcript);

        res.json({ summary });

    } catch (error) {
        console.error("Error fetching transcript or generating summary:", error);
        res.status(500).json({ error: "Failed to fetch transcript or generate summary" });
    }
});

// Helper function to convert the transcript content into a single text block
function getFullTranscript(transcriptData) {
    const content = transcriptData.content;
    let fullText = '';

    if (Array.isArray(content)) {
        content.forEach(item => {
            fullText += item.text + ' ';
        });
    } else {
        return 'No transcript available.';
    }

    return fullText;
}

// Function to summarize transcript using Google Generative AI
async function fetchSummary(transcriptText) {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Summarize the following text:\n\n${transcriptText}`;

    const result = await model.generateContent(prompt);
    return result.response.text();
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
