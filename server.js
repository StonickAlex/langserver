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

        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt,
            max_tokens: 300,
        });

        const generatedText = JSON.parse(response.data.choices[0].text.trim());
        res.json(generatedText);
    } catch (error) {
        console.error('Error generating text:', error);
        res.status(500).json({ error: 'Failed to generate text.' });
    }
});


app.post('/check-translation', async(req, res) => {
    const { originalText, userTranslation } = req.body;

    if (!originalText || !userTranslation) {
        return res.status(400).json({ error: 'Both originalText and userTranslation are required.' });
    }

    try {
        const prompt = `Проверь перевод с русского на польский. Оригинальный текст: "${originalText}". Перевод пользователя: "${userTranslation}". Скажи, правильный ли перевод, и укажи ошибки, если они есть.`;

        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt,
            max_tokens: 500,
        });

        const result = response.data.choices[0].text.trim();
        res.json({ result });
    } catch (error) {
        console.error('Error checking translation:', error);
        res.status(500).json({ error: 'Something went wrong with OpenAI API.' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});