/* ============================================================
   filters.js — Управление фильтрами
   ============================================================ */

/**
 * Инициализирует фильтры: заполняет коды способов доставки,
 * управляет доступностью селекта донора
 */
function initFilters() {
    var deliveryTypeSelect = document.getElementById('deliveryType');
    var deliveryCodeSelect = document.getElementById('deliveryCode');
    var donorSelect = document.getElementById('donor');
    var testModeCheck = document.getElementById('testMode');

    // ---------- Заполнение кодов способа доставки ----------
    function updateDeliveryCodes() {
        var type = deliveryTypeSelect.value;
        var codes = APP.deliveryCodes[type] || [];
        deliveryCodeSelect.innerHTML = '';
        codes.forEach(function (item) {
            var opt = document.createElement('option');
            opt.value = item.code;
            opt.textContent = item.code + ' — ' + item.label;
            deliveryCodeSelect.appendChild(opt);
        });
    }

    deliveryTypeSelect.addEventListener('change', updateDeliveryCodes);
    updateDeliveryCodes();

    // ---------- Управление доступностью донора ----------
    function updateDonorSelectState() {
        donorSelect.disabled = testModeCheck.checked;
    }

    testModeCheck.addEventListener('change', updateDonorSelectState);
    updateDonorSelectState();
}

/**
 * Собирает значения всех фильтров
 * @returns {Object}
 */
function getFilterValues() {
    return {
        product: document.getElementById('product').value,
        cardType: document.getElementById('cardType').value,
        privilege: document.getElementById('privilege').value,
        donorSelection: document.getElementById('donor').value,
        destination: document.getElementById('destination').value,
        deliveryType: document.getElementById('deliveryType').value,
        deliveryCode: document.getElementById('deliveryCode').value,
        testMode: document.getElementById('testMode').checked
    };
}

/**
 * Определяет список доноров для расчёта на основе фильтров
 * @param {Object} filters — результат getFilterValues()
 * @returns {string[]}
 */
function getDonorsToProcess(filters) {
    if (filters.testMode) {
        return APP.donorList;
    }
    if (filters.donorSelection === 'ALL') {
        return APP.donorList;
    }
    return [filters.donorSelection];
}