/* ============================================================
   calculator.js — Расчёт этапов доставки для донора
   ============================================================ */

/**
 * Генерирует этапы доставки для одного донора
 * @param {string} donor — имя донора
 * @param {string} dest — склад комплектации
 * @param {string} deliveryType — тип доставки (ССД/ПВЗ)
 * @param {string} deliveryCode — код способа доставки
 * @param {string} privilege — привилегия клиента
 * @param {string} cardType — тип карты клиента
 * @param {number} baseDateOffset — смещение в днях от сегодня
 * @returns {{ donor: string, stages: Array, deliveryDate: Date }}
 */
function generateStagesForDonor(donor, dest, deliveryType, deliveryCode, privilege, cardType, baseDateOffset) {
    const config = APP.donorConfig[donor];
    if (!config) {
        // fallback на первый донор, если конфиг не найден
        return generateStagesForDonor(APP.donorList[0], dest, deliveryType, deliveryCode, privilege, cardType, baseDateOffset);
    }

    const baseDelayHours = config.baseDelayHours;
    const offsetDays = config.offsetDays;

    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + baseDateOffset + offsetDays);

    // ---------- Расчёт коэффициентов ----------
    let delayFactor = 1.0;
    if (privilege === 'Orange+' || privilege === 'Black') delayFactor *= 0.8;
    if (privilege === 'VIP_online' || privilege === 'CC_Private') delayFactor *= 0.6;
    if (cardType === 'Black') delayFactor *= 0.9;
    if (cardType === 'Orange') delayFactor *= 0.95;

    let effectiveDelayHours = baseDelayHours * delayFactor;

    const codeNum = parseInt(deliveryCode) || 0;
    if (deliveryType === 'ССД') {
        effectiveDelayHours += (codeNum % 10) * 0.2;
    } else {
        effectiveDelayHours += (codeNum % 10) * 0.3;
    }

    // ---------- Расчёт этапов ----------
    const startPick = new Date(baseDate);
    startPick.setHours(9, 0, 0, 0);
    const pickDuration = Math.max(0.5, effectiveDelayHours * 0.3);
    const endPick = new Date(startPick);
    endPick.setHours(startPick.getHours() + pickDuration);

    const startMove = new Date(endPick);
    startMove.setHours(endPick.getHours() + 0.1);
    const moveDuration = Math.max(1, effectiveDelayHours * 0.5);
    const endMove = new Date(startMove);
    endMove.setHours(startMove.getHours() + moveDuration);

    const startPack = new Date(endMove);
    startPack.setHours(endMove.getHours() + 0.1);
    const packDuration = 1.5 + (effectiveDelayHours * 0.1);
    const endPack = new Date(startPack);
    endPack.setHours(startPack.getHours() + packDuration);

    const startPDO = new Date(endPack);
    startPDO.setHours(endPack.getHours() + 0.1);
    const pdoDuration = 1;
    const endPDO = new Date(startPDO);
    endPDO.setHours(startPDO.getHours() + pdoDuration);

    const startDelivery = new Date(endPDO);
    startDelivery.setHours(endPDO.getHours() + 0.1);
    let deliveryDuration = (deliveryType === 'ССД') ? 1 : 2;
    deliveryDuration += effectiveDelayHours * 0.1;
    const endDelivery = new Date(startDelivery);
    endDelivery.setHours(startDelivery.getHours() + deliveryDuration);

    return {
        donor: donor,
        stages: [
            { name: APP.STAGES[0].name, start: startPick, end: endPick, code: APP.STAGES[0].code },
            { name: APP.STAGES[1].name, start: startMove, end: endMove, code: APP.STAGES[1].code },
            { name: APP.STAGES[2].name, start: startPack, end: endPack, code: APP.STAGES[2].code },
            { name: APP.STAGES[3].name, start: startPDO, end: endPDO, code: APP.STAGES[3].code },
            { name: APP.STAGES[4].name, start: startDelivery, end: endDelivery, code: APP.STAGES[4].code }
        ],
        deliveryDate: startDelivery
    };
}

/**
 * Выбирает лучшего донора (с минимальной датой доставки)
 * @param {Array} allDonorData
 * @returns {Object}
 */
function findBestDonor(allDonorData) {
    let best = allDonorData[0];
    allDonorData.forEach(d => {
        if (d.deliveryDate < best.deliveryDate) {
            best = d;
        }
    });
    return best;
}