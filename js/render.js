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