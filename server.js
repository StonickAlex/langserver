const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);


app.post("/generate-text", async(req, res) => {
    const { level } = req.body;

    try {
        const response = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                { role: "system", content: "Генерируй текст на русском языке для уровня: " + level },
                { role: "user", content: `Создай текст для уровня ${level}` },
            ],
        });

        const generatedText = response.data.choices[0].message.content;
        res.json({ russian: generatedText });
    } catch (error) {
        console.error("Ошибка при генерации текста:", error);
        res.status(500).json({ error: "Не удалось сгенерировать текст." });
    }
});


app.post("/check-translation", async(req, res) => {
    const { originalText, userTranslation } = req.body;

    try {
        const feedback = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
                { role: "system", content: "Ты проверяешь переводы и даешь советы по исправлению ошибок." },
                { role: "user", content: `Оригинальный текст: ${originalText}. Перевод пользователя: ${userTranslation}` },
            ],
        });

        const result = feedback.data.choices[0].message.content;
        res.json({ result });
    } catch (error) {
        console.error("Ошибка при проверке перевода:", error);
        res.status(500).json({ error: "Ошибка проверки перевода." });
    }
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});