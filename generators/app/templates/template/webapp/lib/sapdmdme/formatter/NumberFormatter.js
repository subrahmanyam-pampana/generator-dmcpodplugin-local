sap.ui.define([
    'sap/ui/core/format/NumberFormat',
    'sap/dm/dme/constants/DMCConstants'
], function(NumberFormat, DMCConstants) {
    "use strict";

    let oLocale = new sap.ui.core.Locale(sap.ui.getCore().getConfiguration().getLocale().toLocaleString());

    function formatFloatNumber(oValue) {
        if (oValue || oValue === 0) {
            if (oValue % 1 === 0) {
                //is Integer
                let integerFormatter = NumberFormat.getIntegerInstance({
                    groupingEnabled: true
                }, oLocale);
                return integerFormatter.format(oValue);
            } else {
                //is float
                let floatFormatter = NumberFormat.getFloatInstance({
                    decimals: 3
                }, oLocale);
                return floatFormatter.format(oValue);
            }
        } else {
            return "";
        }
    }

    function returnCurrentLocale() {
        return new sap.ui.core.Locale(sap.ui.getCore().getConfiguration().getLocale().toLocaleString());
    }

    function _getMaxIntegerDigits() {
        return DMCConstants.maxIntegerDigits;
    }

    function _getMaxFractionDigits() {
        return DMCConstants.maxFractionDigits;
    }

    function getMinFractionDigits() {
        return DMCConstants.minFractionDigits;
    }

    function _dmcLocaleIntNumberFormatter(oValue) {
        let returnValue = "";
        oValue = oValue === 0 ? "0" : oValue;
        if (oValue && (oValue % 1 === 0)) {
            const oLocaleInternal = returnCurrentLocale();
            let oIntNumberFormat = NumberFormat.getIntegerInstance({
                groupingEnabled: true,
                style: DMCConstants.style,
                parseAsString: true
            }, oLocaleInternal);
            const formattedValue = oIntNumberFormat.format(oValue.toString());
            returnValue = formattedValue;
        }
        return returnValue;
    }

    function _dmcLocaleFloatNumberFormatter(oValue, options) {
        let returnValue = "";
        oValue = oValue === 0 ? "0" : oValue;
        if (oValue) {
            let maxFracDigits = _getMaxFractionDigits();
            let minFracDigits = getMinFractionDigits();
            if (options) {
                if (options.maxFractionDigits >= 0) {
                    maxFracDigits = options.maxFractionDigits;
                }
                if (options.minFractionDigits >= 0) {
                    minFracDigits = options.minFractionDigits;
                }
            }

            if (maxFracDigits < minFracDigits) {
                maxFracDigits = minFracDigits;
            }

            const oLocaleInternal = returnCurrentLocale();

            let oFloatNumberFormat = NumberFormat.getFloatInstance({
                maxFractionDigits: maxFracDigits,
                minFractionDigits: minFracDigits,
                roundingMode: DMCConstants.roundingMode,
                style: DMCConstants.style,
                parseAsString: true
            }, oLocaleInternal);
            const formattedValue = oFloatNumberFormat.format(oValue.toString());
            returnValue = formattedValue;
        }
        return returnValue;
    }

    return {
        /**
         * @deprecated dmcLocaleQuantityFormatterDisplay method should be used
         */
        showValueWithUom: function(value, uom) {
            if (value === null) {
                value = 0;
            }
            if (uom) {
                return `${formatFloatNumber(value)} ${uom}`;
            } else {
                return formatFloatNumber(value);
            }
        },
        /**
         * Format float number check if oValue is not a number return "",
         * check if oValue is integer return format locale number without decimal
         * check if oValue is float return format locale number with 3 decimals
         * @param {string|number} oValue
         * @returns {string}
         * @deprecated dmcLocaleFloatNumberFormatter method should be used
         */
        formatFloatNumber: function(oValue) {
            return formatFloatNumber(oValue);
        },

        /**
         * It converts input data(String|Number) into locale based formatted string based on UOM and format options passed.
         * To be used only for display fields
         * @param {string|Number} oValue It can be a number or number as a string eg. "123", 123
         * @param {string} uom Unit of measurement eg. EA, KG
         * @param {object} options It is a format options object consisting info on min and max fraction digits
         * @returns {string} Locale based formatted string based on UOM and format options given
         */
        dmcLocaleQuantityFormatterDisplay: function(oValue, uom, options) {
            let retValue = "";
            const oValueInternal = parseFloat(oValue);
            if (!isNaN(oValueInternal)) {
                if (DMCConstants.uomEach.includes(uom)) {
                    retValue = _dmcLocaleIntNumberFormatter(oValueInternal);
                } else {
                    retValue = _dmcLocaleFloatNumberFormatter(oValueInternal, options);
                }
            }
            return retValue;
        },

        /**
         * It parses locale based formatted string numbers into number.
         * @param {string} oValue Input is locale based formatted string eg. DE:"123,23", EN:"123,123,123"
         * @returns {string} parsed number as a string eg. "123.23", "123123123"
         */
        dmcLocaleNumberParser: function(oValue) {
            let returnValue = "";
            if (oValue) {
                let oFloatNumberFormat = NumberFormat.getFloatInstance({
                    strictGroupingValidation: true,
                    parseAsString: false
                }, returnCurrentLocale());
                const parsedValue = oFloatNumberFormat.parse(oValue.toString());
                if (!isNaN(parsedValue)) {
                    returnValue = parsedValue;
                }
            }
            return returnValue;
        },

        /**
         * It converts the Intergers(in string or number format) to locale based formatted Interger.
         * To be used only for display fields
         * @param {string|Number} oValue Input is string|Number eg. 1234, "1234"
         * @returns {string} Locale based formatted integer eg. EN: "1,234", DE: "1.234"
         */
        dmcLocaleIntNumberFormatter: function(oValue) {
            return _dmcLocaleIntNumberFormatter(oValue);
        },

        /**
         * It converts the Float Number(in string or number format) to locale based formatted Float Number, which is also based on
         * format options passed(min & max fraction digits).
         * To be used only for display fields
         * @param {string|Number} oValue Input is string|Number eg. 1234.45, "1234.45"
         * @param {object} options It is a format options object consisting info on min and max fraction digits
         * @returns {string} Locale based formatted float number eg. EN: "1,234.45", DE: "1.234,45"
         */
        dmcLocaleFloatNumberFormatter: function(oValue, options) {
            return _dmcLocaleFloatNumberFormatter(oValue, options);
        },

        /**
         * It returns an object with precision and scale which can be used as constraints while binding for decimals
         * @returns {object} returns object with precision and scale
         */
        dmcLocaleDecimalConstraints: function() {
            return {
                "precision": DMCConstants.precision,
                "scale": _getMaxFractionDigits()
            }
        },

        /**
         * It returns an object with precision and scale which can be used as constraints while binding for integers
         * @returns {object} returns object with precision and scale as 0
         */
        dmcLocaleIntegerConstraints: function() {
            return {
                "precision": DMCConstants.precision,
                "scale": 0
            }
        },

        /**
         * Returns the max fraction digits value from DMCConstants file
         * @returns {Number} returns the max fraction digits value from DMCConstants file
         */
        getMaxFractionDigits: function() {
            return _getMaxFractionDigits();
        },

        /**
         * Returns the max intergers digits value from DMCConstants file
         * @returns {Number} returns the max intergers digits value from DMCConstants file
         */
        getMaxIntegerDigits: function() {
            return _getMaxIntegerDigits();
        }
    };
});