const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/edit', (req, res) => res.sendFile(path.join(__dirname, '../public/edit.html')));
app.get('/foods.json', (req, res) => {
    const filePath = path.join(__dirname, '../public/foods.json');
    if (fs.existsSync(filePath)) res.sendFile(filePath);
    else res.status(404).json({ message: 'Файл foods.json не найден' });
});

app.post('/update-foods', (req, res) => {
    try {
        fs.writeFile(path.join(__dirname, '../public/foods.json'), JSON.stringify(req.body, null, 2), (err) => {
            if (err) return res.status(500).json({ message: 'Ошибка сохранения', error: err.message });
            res.json({ message: 'Данные обновлены' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
});

app.post('/upload', express.raw({ type: 'image/*', limit: '10mb' }), (req, res) => {
    const ext = req.headers['content-type'].split('/')[1];
    const filename = \`\${uuidv4()}.\${ext}\`;
    const savePath = path.join(__dirname, '../public/images', filename);
    fs.writeFile(savePath, req.body, (err) => {
        if (err) return res.status(500).json({ message: 'Не удалось сохранить файл' });
        res.json({ imageUrl: \`/images/\${filename}\` });
    });
});

app.delete('/delete-image', express.json(), (req, res) => {
    const filePath = path.join(__dirname, '../public', req.body.imagePath);
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
            if (err) return res.status(500).json({ message: 'Ошибка удаления' });
            res.json({ message: 'Изображение удалено' });
        });
    } else res.status(404).json({ message: 'Файл не найден' });
});

app.get('/home', (req, res) => res.sendFile(path.join(__dirname, '../public/home.html')));
app.get('/menu', (req, res) => res.sendFile(path.join(__dirname, '../public/menu.html')));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, '../public/404.html')));

module.exports = app;
