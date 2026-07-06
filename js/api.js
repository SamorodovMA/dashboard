/* ============================================================
   api.js — API-клиент для связи с Axapta
   ============================================================ */

var API = {};

/**
 * Базовый URL API Axapta.
 * Берётся из конфига APP.apiBaseUrl, по умолчанию пустая строка.
 * @returns {string}
 */
API.getBaseUrl = function () {
    return APP.apiBaseUrl || '';
};

/**
 * Отправляет запрос на расчёт расписания доставки.
 * Пока API нет — использует мок-функцию.
 *
 * @param {Object} params — параметры расчёта
 * @param {string} params.product — артикул товара
 * @param {string} params.cardType — тип карты
 * @param {string} params.privilege — привилегия
 * @param {string[]} params.donors — список доноров
 * @param {string} params.destination — склад комплектации
 * @param {string} params.deliveryType — тип доставки
 * @param {string} params.deliveryCode — код способа
 * @param {boolean} params.testMode — тестовый режим
 * @returns {Promise<Object>}
 */
API.calculate = function (params) {
    if (APP.useMockData) {
        return API._mockCalculate(params);
    }

    var url = API.getBaseUrl() + '/api/calculate';

    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(params)
    })
    .then(function (response) {
        if (!response.ok) {
            return response.json().then(function (err) {
                throw new Error(err.message || 'Ошибка сервера: ' + response.status);
            });
        }
        return response.json();
    });
};

/**
 * Запрашивает список доступных фильтров (товары, доноры, склады и т.д.)
 * @returns {Promise<Object>}
 */
API.getFilterOptions = function () {
    if (APP.useMockData) {
        return API._mockFilterOptions();
    }

    var url = API.getBaseUrl() + '/api/filters';

    return fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    }).then(function (response) {
        if (!response.ok) {
            throw new Error('Ошибка загрузки фильтров: ' + response.status);
        }
        return response.json();
    });
};

/**
 * Проверяет доступность API
 * @returns {Promise<boolean>}
 */
API.healthCheck = function () {
    if (APP.useMockData) {
        return Promise.resolve(false);
    }

    var url = API.getBaseUrl() + '/api/health';

    return fetch(url, { method: 'GET' })
        .then(function () { return true; })
        .catch(function () { return false; });
};

/* ============================================================
   Мок-данные (пока API Axapta не готов)
   ============================================================ */

/**
 * Мок-функция расчёта (имитирует ответ API)
 * @param {Object} params
 * @returns {Promise<Object>}
 */
API._mockCalculate = function (params) {
    return new Promise(function (resolve) {
        // Имитация задержки сети
        setTimeout(function () {
            var allData = [];
            params.donors.forEach(function (donor) {
                var data = generateStagesForDonor(
                    donor,
                    params.destination,
                    params.deliveryType,
                    params.deliveryCode,
                    params.privilege,
                    params.cardType,
                    0
                );
                allData.push(data);
            });

            var bestDonorData = findBestDonor(allData);

            resolve({
                donors: allData.map(function (d) {
                    return {
                        donor: d.donor,
                        stages: d.stages.map(function (s) {
                            return {
                                name: s.name,
                                start: s.start.toISOString(),
                                end: s.end.toISOString(),
                                code: s.code
                            };
                        }),
                        deliveryDate: d.deliveryDate.toISOString()
                    };
                }),
                bestDonor: bestDonorData.donor,
                bestDeliveryDate: bestDonorData.deliveryDate.toISOString(),
                destination: params.destination,
                deliveryType: params.deliveryType,
                deliveryCode: params.deliveryCode
            });
        }, 300); // 300ms имитация сети
    });
};

/**
 * Мок-функция фильтров
 * @returns {Promise<Object>}
 */
API._mockFilterOptions = function () {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve({
                products: ['TEST-001', 'SKU-1001', 'SKU-2002', 'SKU-3003'],
                donors: Object.keys(APP.donorConfig),
                destinations: ['КоптИнтмаг', 'ИнтМаг', 'ДИнтМаг'],
                deliveryTypes: ['ССД', 'ПВЗ'],
                deliveryCodes: APP.deliveryCodes,
                cardTypes: ['White', 'Orange', 'Black'],
                privileges: ['VIP_online', 'Orange+', 'Black', 'VIP_Outlet', 'CC_Private', 'Online_private', 'PVZ_Select']
            });
        }, 200);
    });
};