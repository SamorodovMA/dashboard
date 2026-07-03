/* ============================================================
   filters.js — Управление фильтрами
   ============================================================ */

/**
 * Инициализирует фильтры: заполняет коды способов доставки,
 * управляет доступностью селекта донора
 */
function initFilters() {
    const deliveryTypeSelect = document.getElementById('deliveryType');
    const deliveryCodeSelect = document.getElementById('deliveryCode');
    const donorSelect = document.getElementById('donor');
    const testModeCheck = document.getElementById('testMode');

    // ---------- Заполнение кодов способа доставки ----------
    function updateDeliveryCodes() {
        const type = deliveryTypeSelect.value;
        const codes = APP.deliveryCodes[type] || [];
        deliveryCodeSelect.innerHTML = '';
        codes.forEach(code => {
            const opt = document.createElement('option');
            opt.value = code;
            opt.textContent = code;
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