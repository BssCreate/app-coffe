const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const app = express();
const PORT = 3000;
const { getSheetData } = require("./googleSheets");


// Парсинг JSON из тела запроса
app.use(express.json({ limit: '50mb' }));

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Страница редактирования
app.get('/edit', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'edit.html'));
});

// Получение foods.json
app.get('/foods.json', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'foods.json');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).json({ message: 'Файл foods.json не найден' });
    }
});

// Обрабатываем POST-запрос для обновления данных
app.post('/update-foods', (req, res) => {
    try {
        const updatedData = req.body;

        // Логирование полученных данных
        console.log('Получены данные для обновления:', updatedData);

        // Записываем обновленные данные в файл foods.json
        fs.writeFile(path.join(__dirname, 'public', 'foods.json'), JSON.stringify(updatedData, null, 2), (err) => {
            if (err) {
                console.error('Ошибка записи в файл:', err);
                return res.status(500).json({ message: 'Ошибка при сохранении данных', error: err.message });
            }
            res.json({ message: 'Данные успешно обновлены!' });
        });
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ message: 'Внутренняя ошибка сервера', error: error.message });
    }
});







// Загрузка изображения
app.post('/upload', express.raw({ type: 'image/*', limit: '10mb' }), (req, res) => {
    if (!req.body || !req.headers['content-type']) {
        return res.status(400).json({ message: 'Файл не был загружен' });
    }

    const extension = req.headers['content-type'].split('/')[1];
    const filename = `${uuidv4()}.${extension}`;
    const savePath = path.join(__dirname, 'public', 'images', filename);

    fs.writeFile(savePath, req.body, (err) => {
        if (err) {
            console.error('Ошибка при сохранении:', err);
            return res.status(500).json({ message: 'Не удалось сохранить файл' });
        }
        res.json({ imageUrl: `/images/${filename}` });
    });
});

// Удаление изображения
app.delete('/delete-image', express.json(), (req, res) => {
    const { imagePath } = req.body;
    if (!imagePath) {
        return res.status(400).json({ message: 'Не указан путь к изображению' });
    }
    const filePath = path.join(__dirname, 'public', imagePath);
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Ошибка удаления:', err);
                return res.status(500).json({ message: 'Не удалось удалить изображение' });
            }
            res.json({ message: 'Изображение удалено' });
        });
    } else {
        res.status(404).json({ message: 'Файл не найден' });
    }
});

app.get("/api/menu", async (req, res) => {
    const data = await getSheetData("menu");
    res.json(data);
});

app.get("/api/news", async (req, res) => {
    const data = await getSheetData("news");
    res.json(data);
});

// Маршрут заставки
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'load.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
