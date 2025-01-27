require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY отсутствует');
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/generate-text', async(req, res) => {
    const { level } = req.body;

    if (!level) {
        return res.status(400).json({ error: 'Не указан уровень.' });
    }

    try {
        const prompt = `Объем текста не меньше 50 символов. Создай случайный текст уровня "${level}" на русском языке.  Укажи только русский текст, без поля польского перевода. Ответ верни в формате текста `;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 300,
        });

        const generatedText = response.choices[0].message.content.trim();
        res.json({ russian: generatedText });
    } catch (error) {
        console.error('Ошибка при генерации текста:', error.message);
        res.status(500).json({ error: 'Не удалось сгенерировать текст.' });
    }
});

app.post('/check-translation', async(req, res) => {
    const { originalText, userTranslation } = req.body;

    if (!originalText || !userTranslation) {
        return res.status(400).json({ error: 'Оригинальный текст или перевод не указан.' });
    }

    try {
        const prompt = `Сначала пишешь перевод оригинального текста на Польский язык. После ты проверяешь переводы, сравниваешь текст пользователя и правильный перевод на польский язык, после чего даешь советы по исправлению ошибок, советы и общение с пользователем на русском языке. Оригинальный текст: ${originalText}. Перевод пользователя: ${userTranslation}.`;

        const feedbackResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 300,
        });

        const feedback = feedbackResponse.choices[0].message.content.trim();
        res.json({ result: feedback });
    } catch (error) {
        console.error('Ошибка при проверке перевода:', error.message);
        res.status(500).json({ error: 'Ошибка проверки перевода.' });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});