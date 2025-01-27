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
        const prompt = `Создай случайный текст уровня "${level}" на русском языке. Объем текста не меньше 60 символов. Укажи перевод на польский. Ответ верни в формате JSON с полями "russian" и "polish".`;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 300,
        });

        const generatedText = response.choices[0].message.content.trim();
        res.json({ russian: generatedText, polish: "translated_polish_text" });
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
        const prompt = `Ты проверяешь переводы наглядно сравниваешь текст пользователя и правильный перевод, после показа ему ты даешь советы по исправлению ошибок. Оригинальный текст: ${originalText}. Перевод пользователя: ${userTranslation}.`;

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