// server.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const { GoogleGenerativeAI } = require("@google/generative-ai");
const API_KEY = 'AIzaSyD3FTXJpc05XH3oYJT-0Ad4TnxzmYzGgBA';
const cors = require('cors');
app.use(express.json());
app.use(cors());
app.post('/api/summarize', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: "Text is required in the request body" });
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Summarize the following text:\n\n${text}`;

        const result = await model.generateContent(prompt);
        const summary = result.response.text();

        res.json({ summary });
    } catch (error) {
        console.error("Error generating summary:", error);
        res.status(500).json({ error: "Failed to generate summary" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});