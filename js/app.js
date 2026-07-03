/* ============================================================
   app.js — Главный модуль приложения
   ============================================================ */

(function () {
    'use strict';

    // ---------- Инициализация ----------
    function init() {
        initFilters();

        // Кнопка расчёта
        document.getElementById('calcBtn').addEventListener('click', calculate);

        // Авторасчёт при изменении тестового режима
        document.getElementById('testMode').addEventListener('change', calculate);

        // Авторасчёт при загрузке страницы
        window.addEventListener('DOMContentLoaded', calculate);
    }

    // ---------- Основная функция расчёта ----------
    function calculate() {
        const filters = getFilterValues();
        const donorsToProcess = getDonorsToProcess(filters);

        // Расчёт этапов для каждого донора
        const allData = [];
        donorsToProcess.forEach(donor => {
            const data = generateStagesForDonor(
                donor,
                filters.destination,
                filters.deliveryType,
                filters.deliveryCode,
                filters.privilege,
                filters.cardType,
                0
            );
            allData.push(data);
        });

        // Выбор лучшего донора
        const bestDonorData = findBestDonor(allData);

        // Рендеринг
        renderPDD(bestDonorData.deliveryDate);
        renderStages(allData);
        renderInfo(filters.destination, filters.deliveryType, filters.deliveryCode);
        showResult();
    }

    // ---------- Старт ----------
    init();

})();