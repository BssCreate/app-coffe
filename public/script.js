const testMode = false; // Включить тестовый режим

function updateTime() {
    const now = new Date();
    const options = { 
        weekday: "long", day: "numeric", month: "long", year: "numeric",
        timeZone: "Asia/Novosibirsk"
    };
    
    let nowNovosibirsk = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Novosibirsk" }));

    if (testMode) {
        const testHours = parseInt(document.getElementById("test-hours").value) || nowNovosibirsk.getHours();
        const testMinutes = parseInt(document.getElementById("test-minutes").value) || nowNovosibirsk.getMinutes();
        const selectedDay = document.getElementById("test-day").value || nowNovosibirsk.toLocaleDateString("ru-RU", { weekday: "long" });

        // Устанавливаем дату в соответствии с выбранным днем
        nowNovosibirsk.setHours(testHours, testMinutes, 0);
        // Меняем день недели на выбранный
        nowNovosibirsk.setDate(nowNovosibirsk.getDate() + (selectedDay - nowNovosibirsk.getDay()));
    }

    const dateTimeStr = `${nowNovosibirsk.toLocaleDateString("ru-RU", options)} | ${nowNovosibirsk.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
    document.getElementById("date-time").textContent = dateTimeStr;

    fetch("/api/times")
    .then(response => response.json())
    .then(schedule => {
        let today = nowNovosibirsk.toLocaleDateString("ru-RU", { weekday: "long" });
        today = today.charAt(0).toUpperCase() + today.slice(1);

        const nowHours = nowNovosibirsk.getHours();
        const nowMinutes = nowNovosibirsk.getMinutes();
        const nowStr = nowNovosibirsk.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", hour12: false });

        console.log("Сегодня:", today, "Текущее время:", nowStr);

        const events = schedule[today] || [];
        console.log("События на сегодня:", events);

        let currentText = "Нет уроков"; 
        let timeRemainingText = "";
        let eventBox = document.getElementById("event-box");

        function getMinutesDiff(time1, time2) {
            const [h1, m1] = time1.split(":").map(Number);
            const [h2, m2] = time2.split(":").map(Number);
            return (h2 * 60 + m2) - (h1 * 60 + m1);
        }

        function formatTimeDiff(totalSeconds) {
            let h = Math.floor(totalSeconds / 3600);
            let m = Math.floor((totalSeconds % 3600) / 60);
            let s = totalSeconds % 60;
            if (h > 0) return `До открытия ${h} ч. ${m} мин.`;
            if (m > 0) return `До открытия ${m} мин. ${s} сек.`;
            return `До открытия ${s} сек.`;
        }

        // 🔹 **Обработка ночного времени (с 19:00 до 7:59)**
        if (nowHours >= 19 || nowHours < 7) {
            let targetTime = new Date(nowNovosibirsk);
            targetTime.setHours(7, 0, 0, 0);

            if (nowHours >= 19) {
                targetTime.setDate(targetTime.getDate() + 1);
            }

            let totalSeconds = Math.floor((targetTime - nowNovosibirsk) / 1000);
            currentText = "Закрыто";
            timeRemainingText = formatTimeDiff(totalSeconds);
            eventBox.className = "gray";
        } else {
            let found = false;

            // 🔹 **Перемена до начала первого урока (например, до 08:10)**
            if (events.length > 0 && nowStr >= "07:00" && nowStr < events[0].start) {
                currentText = "Перемена";
                eventBox.className = "green";
                timeRemainingText = `Звонок через ${getMinutesDiff(nowStr, events[0].start)} мин.`;
                found = true;
            }

            for (let i = 0; i < events.length; i++) {
                const event = events[i];

                if (nowStr >= event.start && nowStr < event.end) {
                    currentText = event.text;
                    eventBox.className = "orange";
                    timeRemainingText = `Звонок через ${getMinutesDiff(nowStr, event.end)} мин.`;
                    found = true;
                    break;
                }

                if (i < events.length - 1 && nowStr >= event.end && nowStr < events[i + 1].start) {
                    currentText = "Перемена";
                    eventBox.className = "green";
                    timeRemainingText = `Звонок через ${getMinutesDiff(nowStr, events[i + 1].start)} мин.`;
                    found = true;
                    break;
                }
            }

            if (!found) {
                currentText = "Нет уроков";
                eventBox.className = "gray";
            }
        }

        console.log("Результат:", currentText);
        document.getElementById("event-text").textContent = currentText;
        document.getElementById("time-remaining").textContent = timeRemainingText;

        // 🔹 **Тестовый режим - затемнение всех прямоугольников и белый текст**
        if (testMode) {
            document.querySelectorAll(".event-box").forEach(box => {
                box.style.backgroundColor = "#333";  // Темный фон
                box.style.color = "#fff";  // Белый текст
            });
        }
    })
    .catch(error => console.error("Ошибка загрузки данных:", error));
}

setInterval(updateTime, 1000);
updateTime();
