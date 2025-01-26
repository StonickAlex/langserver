require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/generate-text', async(req, res) => {
    const { level } = req.body;

    if (!level) {
        return res.status(400).json({ error: 'Level is required.' });
    }

    try {
        const prompt = `Создай случайный текст уровня "${level}" на русском языке. Укажи перевод на польский. Ответ верни в формате JSON с полями "russian" и "polish".`;

        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 300,
        });

        const generatedText = JSON.parse(response.data.choices[0].message.content.trim());
        res.json(generatedText);
    } catch (error) {
        console.error('Error generating text:', error.message);
        res.status(500).json({ error: 'Failed to generate text.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});