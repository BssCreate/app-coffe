import fs from "fs";
import path from "path";

export default function handler(req, res) {
    try {
        const filePath = path.join(process.cwd(), "times.json");
        const jsonData = fs.readFileSync(filePath, "utf8");
        const schedule = JSON.parse(jsonData);
        res.status(200).json(schedule);
    } catch (error) {
        console.error("Ошибка API:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
}
