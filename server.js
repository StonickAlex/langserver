const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { OpenAI } = require("openai");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post("/generate-text", async(req, res) => {
    const { level } = req.body;

    try {
        const response = await openai.completions.create({
            model: "text-davinci-003",
            prompt: `Создай текст для уровня ${level} на русском языке`,
            max_tokens: 1000,
        });

        const generatedText = response.choices[0].text;
        res.json({ russian: generatedText });
    } catch (error) {
        console.error("Ошибка при генерации текста:", error);
        res.status(500).json({ error: "Не удалось сгенерировать текст." });
    }
});

app.post("/check-translation", async(req, res) => {
    const { originalText, userTranslation } = req.body;

    try {
        const feedback = await openai.completions.create({
            model: "text-davinci-003",
            prompt: `Оригинальный текст: ${originalText}. Перевод пользователя: ${userTranslation}. Пожалуйста, проверь и предложи исправления.`,
            max_tokens: 1000,
        });

        const result = feedback.choices[0].text;
        res.json({ result });
    } catch (error) {
        console.error("Ошибка при проверке перевода:", error);
        res.status(500).json({ error: "Ошибка проверки перевода." });
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});