/* ============================================================
   render.js — Рендеринг результатов
   ============================================================ */

/**
 * Рендерит календарь ПДД (плановые даты доставки)
 * @param {Date} deliveryDate — дата доставки лучшего донора
 */
function renderPDD(deliveryDate) {
    const pddCalendar = document.getElementById('pddCalendar');
    const dates = getNextDays(APP.PDD_DAYS_COUNT);
    const slots = APP.TIME_SLOTS;

    const selectedDateIndex = findClosestDateIndex(dates, deliveryDate);
    const selectedSlotIndex = selectedDateIndex % slots.length;

    let html = '';
    dates.forEach((d, dayIdx) => {
        const dayLabel = getDayLabel(d, dayIdx);
        const dayNumber = d.getDate();
        const month = getMonthLabel(d);
        const isSelectedDay = (dayIdx === selectedDateIndex);
        const slotText = slots[dayIdx % slots.length];
        const isSelectedSlot = (dayIdx === selectedDateIndex && (dayIdx % slots.length) === selectedSlotIndex);

        html += `
            <div class="pdd-day ${isSelectedDay ? 'selected' : ''}" data-day-index="${dayIdx}">
                <div class="day-week">${dayLabel}</div>
                <div class="day-number">${dayNumber}</div>
                <div class="day-month">${month}</div>
                <div class="day-slot ${isSelectedSlot ? 'selected' : ''}" data-day-index="${dayIdx}" data-slot-index="${dayIdx % slots.length}">${slotText}</div>
            </div>
        `;
    });

    pddCalendar.innerHTML = html;

    // ---------- Обработчики кликов ----------
    const dayElements = pddCalendar.querySelectorAll('.pdd-day');
    const slotElements = pddCalendar.querySelectorAll('.day-slot');

    function clearSelection() {
        dayElements.forEach(el => el.classList.remove('selected'));
        slotElements.forEach(el => el.classList.remove('selected'));
    }

    dayElements.forEach(dayEl => {
        dayEl.addEventListener('click', function (e) {
            if (e.target.classList.contains('day-slot')) return;
            clearSelection();
            this.classList.add('selected');
        });
    });

    slotElements.forEach(slotEl => {
        slotEl.addEventListener('click', function (e) {
            e.stopPropagation();
            clearSelection();
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