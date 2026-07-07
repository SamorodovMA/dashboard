/* ============================================================
   models.js — Модели данных (DTO) для API Axapta
   ============================================================ */

/**
 * Преобразует DonorResultDto из API во внутренний формат
 * @param {Object} dto
 * @returns {{ donor: string, stages: Array, deliveryDate: Date }}
 */
function donorDtoToInternal(dto) {
    return {
        donor: dto.donor,
        stages: dto.stages.map(function (s) {
            return {
                name: s.name,
                start: new Date(s.start),
                end: new Date(s.end),
                code: s.code
            };
        }),
        deliveryDate: new Date(dto.deliveryDate)
    };
}

/**
 * Преобразует CalculationResponse из API во внутренний формат
 * @param {Object} dto
 * @returns {{ allData: Array, bestDonorData: Object, destination: string, deliveryType: string, deliveryCode: string }}
 */
function calculationResponseToInternal(dto) {
    var allData = dto.donors.map(donorDtoToInternal);
    var bestDonorData = allData.find(function (d) { return d.donor === dto.bestDonor; }) || allData[0];
    return {
        allData: allData,
        bestDonorData: bestDonorData,
        destination: dto.destination,
        deliveryType: dto.deliveryType,
        deliveryCode: dto.deliveryCode
}

/**
 * Преобразует OrderCalculationDto из API во внутренний формат
 * @param {Object} dto — ответ от GET /api/orders/{orderId}/calculation
 * @returns {Object}
 */
function orderCalculationToInternal(dto) {
    return {
        orderId: dto.orderId,
        product: dto.product,
        cardType: dto.cardType,
        privilege: dto.privilege,
        donor: dto.donor,
        destination: dto.destination,
        deliveryType: dto.deliveryType,
        deliveryCode: dto.deliveryCode,
        stages: dto.stages.map(function (s) {
            return {
                name: s.name,
                start: new Date(s.start),
                end: s.end ? new Date(s.end) : null,
                code: s.code
            };
        }),
        deliveryDate: new Date(dto.deliveryDate)
    };
}