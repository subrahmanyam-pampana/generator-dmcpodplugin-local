sap.ui.define(["sap/dm/dme/constants/DMCConstants", "sap/ui/core/format/NumberFormat"], function(DMCConstants, NumberFormat) {
    "use strict";

    /**
     * function to compare 2 positive integer string
     * @param {*} sIntA
     * @param {*} sIntB
     * @returns number 1 if A > B, -1 if A < B, 0 if A == B
     */
    let comparePosInt = function(sIntA, sIntB) {
        if (sIntA.length > sIntB.length) {
            return 1;
        } else if (sIntA.length < sIntB.length) {
            return -1;
        } else {
            for (let i = 0; i < sIntA.length; i++) {
                if (sIntA[i] > sIntB[i]) {
                    return 1;
                } else if (sIntA[i] < sIntB[i]) {
                    return -1;
                }
            }
        }
        return 0;
    }

    /**
     * function to compare 2 positive decimal part string (in integer value style) e.g. "123" for decimal part of "-12.123"
     * @param {*} sDecA
     * @param {*} sDecB
     * @returns number 1 if A > B, -1 if A < B, 0 if A == B
     */
    let comparePosDecimal = function(sDecA, sDecB) {
        let iLength = sDecA.length > sDecB.length ? sDecA.length : sDecB.length;

        for (let i = 0; i < iLength; i++) {
            if (isNaN(sDecA[i])) {
                return -1
            } else if (isNaN(sDecB[i])) {
                return 1;
            } else if (sDecA[i] > sDecB[i]) {
                return 1;
            } else if (sDecA[i] < sDecB[i]) {
                return -1;
            }
        }

        return 0;
    }

    let getMinus = function(sNumA) {
        return sNumA.indexOf("-") !== -1 ? -1 : 1;
    }

    let getNumbersData = function(sNumAConverted, sNumBConverted, sDecimalSep) {
        let oNumbersData = {};
        oNumbersData.sIntA = (sNumAConverted.indexOf(sDecimalSep) === -1) ? sNumAConverted : sNumAConverted.split(sDecimalSep)[0];
        oNumbersData.sDecA = (sNumAConverted.indexOf(sDecimalSep) === -1) ? "0" : sNumAConverted.split(sDecimalSep)[1];
        oNumbersData.sIntB = (sNumBConverted.indexOf(sDecimalSep) === -1) ? sNumBConverted : sNumBConverted.split(sDecimalSep)[0];
        oNumbersData.sDecB = (sNumBConverted.indexOf(sDecimalSep) === -1) ? "0" : sNumBConverted.split(sDecimalSep)[1];
        return oNumbersData;
    }

    let NumberUtils = {
        /**
         * function to compare 2 number string
         * @param {string} sNumA
         * @param {string} sNumB
         * @param {string} sGroupingSeparator grouping separator by locale
         * @param {string} sDecimalSeparator decimal separator by locale
         * 
         * @returns number return 1 if A > B, return -1 if A < B, return 0 if A == B
         */
        compareNumber: function(sNumA, sNumB, sGroupingSeparator, sDecimalSeparator) {
            let sGroupingSep, sDecimalSep;
            let oNumberFormat;
            let iMinus;

            // get group separator and decimal separator
            if (!sGroupingSeparator || !sDecimalSeparator) {
                let oLocale = new sap.ui.core.Locale(sap.ui.getCore().getConfiguration().getLocale().toLocaleString());
                oNumberFormat = NumberFormat.getFloatInstance({}, oLocale);
                sGroupingSep = oNumberFormat.oFormatOptions.groupingSeparator;
                sDecimalSep = oNumberFormat.oFormatOptions.decimalSeparator;
            } else {
                sGroupingSep = sGroupingSeparator || oNumberFormat.oFormatOptions.groupingSeparator;
                sDecimalSep = sDecimalSeparator || oNumberFormat.oFormatOptions.decimalSeparator;
            }

            // convert value to positive for comparison if necessary
            if (sNumA.indexOf("-") === -1 && sNumB.indexOf("-") > 0) {
                // if sNumA is positive and sNumB is negative, return 1 as "A > B"
                return 1;
            } else if (sNumA.indexOf("-") > 0 && sNumB.indexOf("-") === -1) {
                // if sNumA is negative and sNumB is positive, return -1 as "A < B"
                return -1;
            } else {
                // if sNumA and sNumB both are negative, compare the numbers as positive and times -1 before result returned
                iMinus = getMinus(sNumA);
            }

            let iPositiveResult = 0;

            let sNumAConverted = sNumA.split(sGroupingSep).join("").split("-").join("");
            let sNumBConverted = sNumB.split(sGroupingSep).join("").split("-").join("");

            // extract integer parts and decimal parts
            let oIntDecData = getNumbersData(sNumAConverted, sNumBConverted, sDecimalSep);
            let sIntA = oIntDecData.sIntA;
            let sDecA = oIntDecData.sDecA;
            let sIntB = oIntDecData.sIntB;
            let sDecB = oIntDecData.sDecB;

            // compare integer parts
            iPositiveResult = comparePosInt(sIntA, sIntB);
            if (iPositiveResult !== 0) {
                return iPositiveResult * iMinus;
            }

            // compare decimal parts
            iPositiveResult = comparePosDecimal(sDecA, sDecB);
            if (iPositiveResult !== 0) {
                return iPositiveResult * iMinus;
            }

            return 0;
        },

        /**
         * Generates random integers with max limit
         * @param maxLimit The max length of the integer to be generated
         * If no param is provided, the max length will be taken from DMCConstants
         */
        generateInteger: function(maxLimit) {
            maxLimit = (maxLimit) ? maxLimit : DMCConstants.maxIntegerDigits;
            let integer = 9;
            for (let index = 1; index < maxLimit; index++) {
                integer = integer * 10 + 9;
            }
            return integer;
        },

        /**
         * Generates decimals with max limit
         * @param maxLimit The max length of the decimal to be generated
         * If no param is provided, the max length will be taken from DMCConstants
         */
        generateDecimals: function(maxLimit) {
            maxLimit = (maxLimit) ? maxLimit : DMCConstants.maxFractionDigits;
            let decimal = 0.1;
            for (let index = 1; index < maxLimit; index++) {
                decimal /= 10;
            }
            return decimal;
        }
    };

    return NumberUtils;
});