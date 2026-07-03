/* ============================================================
   utils.js — Вспомогательные функции
   ============================================================ */

/**
 * Форматирует дату в локализованную строку (дд.мм чч:мм)
 * @param {Date} date
 * @returns {string}
 */
function formatDateShort(date) {
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Создаёт массив дат на N дней, начиная с сегодняшнего дня
 * @param {number} daysCount
 * @returns {Date[]}
 */
function getNextDays(daysCount) {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < daysCount; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d);
    }
    return dates;
}

/**
 * Возвращает название дня недели на русском (коротко)
 * @param {Date} date
 * @returns {string}
 */
function getDayLabel(date, index) {
    if (index === 0) return 'Сегодня';
    if (index === 1) return 'Завтра';
    return date.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', '');
}

/**
 * Возвращает название месяца на русском (коротко)
 * @param {Date} date
 * @returns {string}
 */
function getMonthLabel(date) {
    return date.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '');
}

/**
 * Находит индекс ближайшей даты к targetDate в массиве dates
 * @param {Date[]} dates
 * @param {Date} targetDate
 * @returns {number}
 */
function findClosestDateIndex(dates, targetDate) {
    let minDiff = Infinity;
    let closestIndex = 0;
    dates.forEach((d, idx) => {
        const diff = Math.abs(d - targetDate);
        if (diff < minDiff) {
            minDiff = diff;
            closestIndex = idx;
        }
    });
    return closestIndex;
}