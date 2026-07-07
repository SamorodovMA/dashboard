/* ============================================================
   render.js — Рендеринг результатов
   ============================================================ */

/**
 * Рендерит календарь ПДД (плановые даты доставки)
 * Даты и интервалы отображаются отдельными строками с независимым выбором
 * @param {Date} deliveryDate — дата доставки лучшего донора
 */
function renderPDD(deliveryDate) {
    var pddCalendar = document.getElementById('pddCalendar');
    var dates = getNextDays(APP.PDD_DAYS_COUNT);
    var slots = APP.TIME_SLOTS;

    var selectedDateIndex = findClosestDateIndex(dates, deliveryDate);
    var selectedSlotIndex = 0; // по умолчанию первый слот

    // ---------- Строка с датами ----------
    var datesHtml = '';
    dates.forEach(function (d, dayIdx) {
        var dayLabel = getDayLabel(d, dayIdx);
        var dayNumber = d.getDate();
        var month = getMonthLabel(d);
        var isSelected = (dayIdx === selectedDateIndex);

        datesHtml +=
            '<div class="pdd-day ' + (isSelected ? 'selected' : '') + '" data-day-index="' + dayIdx + '">' +
                '<div class="day-week">' + dayLabel + '</div>' +
                '<div class="day-number">' + dayNumber + '</div>' +
                '<div class="day-month">' + month + '</div>' +
            '</div>';
    });

    // ---------- Строка с интервалами ----------
    var slotsHtml = '';
    slots.forEach(function (slot, slotIdx) {
        var isSelected = (slotIdx === selectedSlotIndex);
        slotsHtml +=
            '<div class="pdd-slot ' + (isSelected ? 'selected' : '') + '" data-slot-index="' + slotIdx + '">' +
                slot +
            '</div>';
    });

    pddCalendar.innerHTML =
        '<div class="pdd-dates-row">' + datesHtml + '</div>' +
        '<div class="pdd-slots-row">' + slotsHtml + '</div>';

    // ---------- Обработчики кликов на даты ----------
    var dayElements = pddCalendar.querySelectorAll('.pdd-day');
    dayElements.forEach(function (el) {
        el.addEventListener('click', function () {
            dayElements.forEach(function (d) { d.classList.remove('selected'); });
            this.classList.add('selected');
        });
    });

    // ---------- Обработчики кликов на интервалы ----------
    var slotElements = pddCalendar.querySelectorAll('.pdd-slot');
    slotElements.forEach(function (el) {
        el.addEventListener('click', function () {
            slotElements.forEach(function (s) { s.classList.remove('selected'); });
            this.classList.add('selected');
        });
    });
}

/**
 * Рендерит таблицу детализации этапов по всем донорам
 * @param {Array} allDonorData
 */
function renderStages(allDonorData) {
    var stagesBody = document.getElementById('stagesBody');
    var html = '';

    allDonorData.forEach(function (donorData) {
        var donor = donorData.donor;
        donorData.stages.forEach(function (stage, idx) {
            var startStr = formatDateShort(stage.start);
            var endStr = formatDateShort(stage.end);
            var donorDisplay = (idx === 0) ? donor : '';

            // Для этапов "ПДО" и "ПДД" показываем прочерк в колонке "Конец"
            var isEndlessStage = (stage.name === 'ПДО' || stage.name === 'ПДД');
            var endDisplay = isEndlessStage ? '—' : endStr;

            html += '<tr>' +
                '<td data-label="Донор">' + donorDisplay + '</td>' +
                '<td class="stage-name" data-label="Этап">' + stage.name + '</td>' +
                '<td class="stage-dates" data-label="Начало">' + startStr + '</td>' +
                '<td class="stage-dates" data-label="Конец">' + endDisplay + '</td>' +
                '<td data-label="Код"><span class="stage-code">' + stage.code + '</span></td>' +
                '</tr>';
        });
        html += '<tr style="height: 0.5rem;"><td colspan="5" style="background: transparent; border: none;"></td></tr>';
    });

    stagesBody.innerHTML = html;
}

/**
 * Обновляет информационную панель (склад, тип доставки, код)
 * @param {string} destination
 * @param {string} deliveryType
 * @param {string} deliveryCode
 */
function renderInfo(destination, deliveryType, deliveryCode) {
    document.getElementById('selectedDestination').textContent = destination;
    document.getElementById('selectedDeliveryType').textContent = deliveryType;
    document.getElementById('selectedDeliveryCode').textContent = deliveryCode;
}

/**
 * Показывает карточку результата и скрывает плейсхолдер
 */
function showResult() {
    document.getElementById('resultPlaceholder').style.display = 'none';
    document.getElementById('resultCard').style.display = 'block';
}

/**
 * Сбрасывает результат (показывает плейсхолдер, скрывает карточку)
 */
function hideResult() {
    document.getElementById('resultPlaceholder').style.display = 'flex';
    document.getElementById('resultCard').style.display = 'none';
}

/* ============================================================
   Блок "Детализация расчёта по заказу"
   ============================================================ */

/**
 * Рендерит блок детализации расчёта по конкретному заказу
 * @param {Object} data — результат orderCalculationToInternal()
 */
function renderOrderCalculation(data) {
    var container = document.getElementById('orderCalcResult');

    // Информация о заказе
    var infoHtml =
        '<div class="order-info-grid">' +
            '<div class="order-info-item"><span class="order-info-label">Номер заказа</span><span class="order-info-value">' + escapeHtml(data.orderId) + '</span></div>' +
            '<div class="order-info-item"><span class="order-info-label">Товар</span><span class="order-info-value">' + escapeHtml(data.product) + '</span></div>' +
            '<div class="order-info-item"><span class="order-info-label">Донор</span><span class="order-info-value">' + escapeHtml(data.donor) + '</span></div>' +
            '<div class="order-info-item"><span class="order-info-label">Склад комплектации</span><span class="order-info-value">' + escapeHtml(data.destination) + '</span></div>' +
            '<div class="order-info-item"><span class="order-info-label">Тип доставки</span><span class="order-info-value">' + escapeHtml(data.deliveryType) + '</span></div>' +
            '<div class="order-info-item"><span class="order-info-label">Код способа</span><span class="order-info-value">' + escapeHtml(data.deliveryCode) + '</span></div>' +
            '<div class="order-info-item"><span class="order-info-label">Тип карты</span><span class="order-info-value">' + escapeHtml(data.cardType) + '</span></div>' +
            '<div class="order-info-item"><span class="order-info-label">Привилегия</span><span class="order-info-value">' + escapeHtml(data.privilege) + '</span></div>' +
        '</div>';

    // Таблица этапов
    var stagesHtml = '';
    data.stages.forEach(function (stage) {
        var startStr = formatDateShort(stage.start);
        var endStr = stage.end ? formatDateShort(stage.end) : '—';
        var isEndlessStage = (stage.name === 'ПДО' || stage.name === 'ПДД');
        var endDisplay = isEndlessStage ? '—' : endStr;

        stagesHtml += '<tr>' +
            '<td class="stage-name" data-label="Этап">' + escapeHtml(stage.name) + '</td>' +
            '<td class="stage-dates" data-label="Начало">' + startStr + '</td>' +
            '<td class="stage-dates" data-label="Конец">' + endDisplay + '</td>' +
            '<td data-label="Код"><span class="stage-code">' + escapeHtml(stage.code) + '</span></td>' +
        '</tr>';
    });

    var deliveryDateStr = formatDateShort(data.deliveryDate);

    container.innerHTML =
        '<div class="order-calc-card">' +
            '<div class="order-calc-header">' +
                '<span class="order-calc-title">📋 Детализация расчёта по заказу</span>' +
                '<span class="order-calc-badge">' + escapeHtml(data.orderId) + '</span>' +
            '</div>' +
            infoHtml +
            '<div class="order-calc-delivery">' +
                '<strong>Плановая дата доставки:</strong> ' + deliveryDateStr +
            '</div>' +
            '<h4 style="font-weight: 500; font-size: 0.95rem; margin: 1rem 0 0.5rem; color: #000;">Этапы обработки</h4>' +
            '<table class="stages-table order-stages-table">' +
                '<thead>' +
                    '<tr>' +
                        '<th style="width: 25%;">Этап</th>' +
                        '<th style="width: 30%;">Начало</th>' +
                        '<th style="width: 25%;">Конец</th>' +
                        '<th style="width: 20%;">Код расписания</th>' +
                    '</tr>' +
                '</thead>' +
                '<tbody>' + stagesHtml + '</tbody>' +
            '</table>' +
        '</div>';

    container.style.display = 'block';
}

/**
 * Скрывает блок детализации расчёта по заказу
 */
function hideOrderCalculation() {
    var container = document.getElementById('orderCalcResult');
    if (container) {
        container.style.display = 'none';
    }
}

/**
 * Показывает ошибку в блоке поиска заказа
 * @param {string} message
 */
function showOrderError(message) {
    var container = document.getElementById('orderCalcResult');
    if (container) {
        container.innerHTML =
            '<div class="order-calc-card order-calc-error">' +
                '<div class="order-calc-header">' +
                    '<span class="order-calc-title">❌ Ошибка</span>' +
                '</div>' +
                '<p style="color: var(--color-error-text); margin: 0;">' + escapeHtml(message) + '</p>' +
            '</div>';
        container.style.display = 'block';
    }
}

/**
 * Показывает лоадер в блоке поиска заказа
 */
function showOrderLoader() {
    var container = document.getElementById('orderCalcResult');
    if (container) {
        container.innerHTML =
            '<div class="order-calc-card" style="text-align: center; padding: 2rem;">' +
                '<div class="loader-spinner" style="margin: 0 auto 1rem;"></div>' +
                '<div class="loader-text">Загрузка расчёта заказа...</div>' +
            '</div>';
        container.style.display = 'block';
    }
}

/**
 * Простое экранирование HTML
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}