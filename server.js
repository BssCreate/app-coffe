const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static("public")); // Раздача статики

app.get("/api/times", (req, res) => {
    fs.readFile("times.json", "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Ошибка чтения файла" });
        }
        res.json(JSON.parse(data));
    });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
