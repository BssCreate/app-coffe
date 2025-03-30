const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Загружаем конфигурацию и ключи для доступа к Google Sheets
const credentials = require(path.join(__dirname, '../config', 'google-credentials.json'));

// Настройки для Google Sheets API
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const SPREADSHEET_ID = 'SPREA1XOe29zxWW0mgVrZQSAu-9TQ4i7dfvYOBkq7-VvWg2nY'; // Заменить на ID вашего листа

// Функция авторизации в Google API
async function authenticateGoogle() {
    const { client_email, private_key } = credentials;

    const auth = new google.auth.JWT(
        client_email,
        null,
        private_key,
        SCOPES
    );

    const sheets = google.sheets({ version: 'v4', auth });

    return sheets;
}

// Функция для получения данных с листа
async function getSheetData(sheetName) {
    const sheets = await authenticateGoogle();

    const request = {
        spreadsheetId: SPREADSHEET_ID,
        range: sheetName, // Название листа (например "menu" или "news")
    };

    try {
        const response = await sheets.spreadsheets.values.get(request);
        return response.data.values;
    } catch (error) {
        console.error('Ошибка получения данных с Google Sheets:', error);
        return null;
    }
}

module.exports = {
    getSheetData,
};
