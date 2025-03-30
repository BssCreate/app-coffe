const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

// Загружаем сервисный аккаунт
const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, "service-account.json"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

async function getSheetData(sheetName) {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = "SPREA1XOe29zxWW0mgVrZQSAu-9TQ4i7dfvYOBkq7-VvWg2nY";
    const range = `${sheetName}!A:D`; // Диапазон

    const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
    });

    return response.data.values;
}

module.exports = { getSheetData };
