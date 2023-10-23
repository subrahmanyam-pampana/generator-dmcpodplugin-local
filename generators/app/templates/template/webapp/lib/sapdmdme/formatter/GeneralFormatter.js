sap.ui.define([

], function() {
    "use strict";

    return {

        /**
         * Creates entity title combining name and revision values
         * @param {string} sName entity's name
         * @param {string} sVersion entity's version
         * @param {string} sDefaultTitle default title if name and revision is not specified (when new entity is created)
         */
        getRevisionableTitle: function(sName, sVersion, sDefaultTitle) {
            let aResult = [];

            if (sName) {
                aResult.push(sName.toUpperCase());
            }
            if (sVersion) {
                aResult.push(sVersion.toUpperCase());
            }

            return aResult.length > 0 ? aResult.join(" / ") : sDefaultTitle;
        },

        /**
         * Formats non revisionable entity title
         * @param {string} sName entity's name
         * @param {string} sDefaultTitle default title if name is not specified (when new entity is created)
         * @returns {string} title as entered entity's name converted to uppercase or default title
         */
        getTitle: function(sName, sDefaultTitle) {
            return sName ? sName.toUpperCase() : sDefaultTitle;
        },

        /**
         * Trims leading and trailing 0's
         * @param {string or number} oValue
         * @param {string} sDefault?  Optional value to return for "" or "0"
         */
        trimZerosFromNumber: function(oValue, sDefaultValue) {
            let sDefaultResult = "";
            if (sDefaultValue !== "undefined" && jQuery.trim(sDefaultValue)) {
                sDefaultResult = sDefaultValue;
            }
            if (!oValue) {
                return sDefaultResult;
            }
            let sValue = oValue;
            if (oValue.toFixed) {
                sValue = oValue.toString();
            }
            if (this.isNotNumeric(sValue)) {
                return sDefaultResult;
            }
            sValue = sValue.replace(/^0+(\d)|(\d)0+$/gm, '$1$2');
            if (sValue.endsWith(".0")) {
                sValue = sValue.substring(0, sValue.indexOf("."));
            } else if (sValue.endsWith(",0")) {
                sValue = sValue.substring(0, sValue.indexOf(","));
            }
            if (sValue === "0") {
                return sDefaultResult;
            }

            return sValue;
        },

        /**
         * Checks if input string represents a number
         * Unlike isNaN(), this handle DE or FR languages (", separator)
         * @param {string} sValue
         * @return true if input is a number, else false
         */
        isNotNumeric: function(sValue) {
            if (!jQuery.trim(sValue) || !sValue.split) {
                // empty string or not a String
                return true;
            }
            let n = sValue.split(",").join("");
            return isNaN(n);
        },

        addColon: function(sValue) {
            return sValue + ":";
        }
    };
});