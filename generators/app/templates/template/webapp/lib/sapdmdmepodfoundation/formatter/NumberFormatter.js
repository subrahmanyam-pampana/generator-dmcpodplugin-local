sap.ui.define([
    "sap/ui/core/format/NumberFormat",
    "sap/dm/dme/formatter/NumberFormatter",
    "sap/ui/core/Locale"
], function(NumberFormat, NumberFormatter, Locale) {
    "use strict";

    return {
        getFloatValue: function(sValue, sGroupChar, sDecimalChar) {
            let sReturnValue = "";
            const oNumberFormat = this.baseNumberFormat();
            // Get the Grouping & Decimal Separator for the current locale
            let sGroupingSep;
            let sDecimalSep;
            if (sGroupChar && sDecimalChar) {
                sGroupingSep = sGroupChar;
                sDecimalSep = sDecimalChar;
            } else {
                sGroupingSep = oNumberFormat.oFormatOptions.groupingSeparator;
                sDecimalSep = oNumberFormat.oFormatOptions.decimalSeparator;
            }

            let sChar = "";
            for (let i = 0; i < sValue.length; i++) {
                sChar = sValue.substring(i, i + 1);
                if (sChar === sDecimalSep) {
                    sChar = sChar.replace(sDecimalSep, ".");
                } else if (sChar === sGroupingSep) {
                    sChar = "";
                }

                sReturnValue = sReturnValue + sChar;
            }

            return NumberFormatter.dmcLocaleNumberParser(sReturnValue);
        },

        convertFloatToLocal: function(fFloatValue, sGroupChar, sDecimalChar) {
            let sReturnValue = "";
            if (!fFloatValue) {
                return "";
            }
            const sValue = fFloatValue.toString();
            const oNumberFormat = this.baseNumberFormat();
            // Get the Grouping & Decimal Separator for the current locale
            let sGroupingSep;
            let sDecimalSep;
            if (sGroupChar && sDecimalChar) {
                sGroupingSep = sGroupChar;
                sDecimalSep = sDecimalChar;
            } else {
                sGroupingSep = oNumberFormat.oFormatOptions.groupingSeparator;
                sDecimalSep = oNumberFormat.oFormatOptions.decimalSeparator;
            }

            if (sGroupingSep === "," && sDecimalSep === ".") {
                return sValue;
            }

            let sChar = "";
            for (let i = 0; i < sValue.length; i++) {
                sChar = sValue.substring(i, i + 1);
                if (sChar === ".") {
                    sChar = sChar.replace(".", sDecimalSep);
                } else if (sChar === ",") {
                    sChar = "";
                }

                sReturnValue = sReturnValue + sChar;
            }

            return sReturnValue;
        },

        baseNumberFormat: function() {
            const oLocale = new Locale(sap.ui.getCore().getConfiguration().getLocale().toLocaleString());
            return NumberFormat.getFloatInstance({
                strictGroupingValidation: true
            }, oLocale);
        }

    }
})