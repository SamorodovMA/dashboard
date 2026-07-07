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

        // ---------- Блок поиска по заказу ----------
        document.getElementById('orderCalcBtn').addEventListener('click', loadOrderCalculation);

        // Поиск по заказу по Enter в поле ввода
        document.getElementById('orderIdInput').addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                loadOrderCalculation();
            }
        });

        // Авторасчёт при загрузке страницы
        calculate();
    }

    // ---------- Основная функция расчёта ----------
    function calculate() {
        var filters = getFilterValues();
        var donorsToProcess = getDonorsToProcess(filters);

        // Показываем лоадер, скрываем ошибку
        showLoader();
        hideError();

        // Формируем параметры запроса
        var params = {
            product: filters.product,
            cardType: filters.cardType,
            privilege: filters.privilege,
            donors: donorsToProcess,
            destination: filters.destination,
            deliveryType: filters.deliveryType,
            deliveryCode: filters.deliveryCode,
            testMode: filters.testMode
        };

        // Вызов API (или мок-данных)
        API.calculate(params)
            .then(function (response) {
                // Преобразуем ответ API во внутренний формат
                var result = calculationResponseToInternal(response);

                // Рендеринг
                renderPDD(result.bestDonorData.deliveryDate);
                renderStages(result.allData);
                renderInfo(result.destination, result.deliveryType, result.deliveryCode);
                showResult();
                hideLoader();
            })
            .catch(function (error) {
                // Ошибка — показываем сообщение
                hideLoader();
                showError(error.message || 'Произошла ошибка при расчёте');
            });
    }

    // ---------- Загрузка детализации расчёта по заказу ----------
    function loadOrderCalculation() {
        var input = document.getElementById('orderIdInput');
        var orderId = input.value.trim();

        if (!orderId) {
            showOrderError('Введите номер заказа');
            return;
        }

        showOrderLoader();

        API.getOrderCalculation(orderId)
            .then(function (response) {
                var data = orderCalculationToInternal(response);
                renderOrderCalculation(data);
            })
            .catch(function (error) {
                showOrderError(error.message || 'Ошибка загрузки расчёта заказа');
            });
    }

    // ---------- Управление лоадером ----------
    function showLoader() {
        var loader = document.getElementById('loader');
        if (loader) loader.style.display = 'flex';
    }

    function hideLoader() {
        var loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
    }

    // ---------- Управление ошибками ----------
    function showError(message) {
        var errorEl = document.getElementById('errorMessage');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
        }
        // Скрываем результат, показываем плейсхолдер
        document.getElementById('resultPlaceholder').style.display = 'flex';
        document.getElementById('resultCard').style.display = 'none';
    }

    function hideError() {
        var errorEl = document.getElementById('errorMessage');
        if (errorEl) {
            errorEl.style.display = 'none';
        }
    }

    // ---------- Старт ----------
    init();

})();