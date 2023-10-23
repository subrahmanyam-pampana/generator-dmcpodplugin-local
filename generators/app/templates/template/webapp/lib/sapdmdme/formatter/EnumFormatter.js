sap.ui.define([], function() {
    "use strict";

    let oResourceBundle;

    let aNcCodeCategoryKeys = [
        "FAILURE",
        "DEFECT",
        "REPAIR"
    ];

    let aNcCodeSeverityKeys = [
        "None",
        "Low",
        "Medium",
        "High"
    ];

    let aWorkCenterCategoryKeys = [
        "NONE",
        "CELL",
        "CELL_GROUP",
        "LINE",
        "LINE_GROUP",
        "BUILDING"
    ];

    let aShiftCategoryKeys = [
        "NONE",
        "USER",
        "RESOURCE",
        "WORKCENTER"
    ];

    let aLaborAssignmentKeys = [
        "ACTUAL_DAY",
        "SHIFT_START_DAY",
        "SHIFT_END_DAY"
    ];

    let aDayTypeKeys = [
        "PRODUCTION",
        "NONPRODUCTION"
    ];

    function createTranslatedItemList(sBundleKeyPrefix, aKeys, bAddAll) {
        let aResultKeys = bAddAll ? ["ALL"].concat(aKeys) : aKeys;

        return aResultKeys.map(function(sKey) {
            return {
                key: sKey,
                text: oResourceBundle.getText(sBundleKeyPrefix + sKey)
            };
        });
    }

    return {
        init: function(oBundle) {
            oResourceBundle = oBundle;
        },

        /**
         * Creates an array of NC Code Category keys with translated values and with All option at the beginning.
         * It's used in a filter bar in Select control as a list of selection items.
         * @returns {array} array of objects in a format { key: <key>, text: <translated value> }
         */
        getNcCodeCategoryListForFilter: function() {
            return createTranslatedItemList("enum.ncCodeCategory.", aNcCodeCategoryKeys, true);
        },

        /**
         * Creates an array of NC Code Severity keys with translated values and with All option at the beginning.
         * It's used in a filter bar in Select control as a list of selection items.
         * @returns {array} array of objects in a format { key: <key>, text: <translated value> }
         */
        getNcCodeSeverityListForFilter: function() {
            return createTranslatedItemList("enum.ncCodeSeverity.", aNcCodeSeverityKeys, true);
        },

        getNcCodeCategoryText: function(sValue) {
            return oResourceBundle.getText("enum.ncCodeCategory." + sValue);
        },

        /**
         * Creates an array of Work Center Category keys with translated values and with All option at the beginning.
         * It's used in a filter bar in Select control as a list of selection items.
         * @returns {array} array of objects in a format { key: <key>, text: <translated value> }
         */
        getWorkCenterCategoryListForFilter: function() {
            return createTranslatedItemList("enum.workCenterCategory.", aWorkCenterCategoryKeys, true);
        },

        getWorkCenterCategoryText: function(sValue) {
            return oResourceBundle.getText("enum.workCenterCategory." + sValue);
        },

        /**
         * Creates an array of Shift Category keys with translated values.
         * @returns {array} array of objects in a format { key: <key>, text: <translated value> }
         */
        getShiftCategoryList: function() {
            return createTranslatedItemList("enum.shiftCategory.", aShiftCategoryKeys, false);
        },

        /**
         * Creates an array of Labor Assignments for Shifts keys with translated values.
         * @returns {array} array of objects in a format { key: <key>, text: <translated value> }
         */
        getLaborAssignmentList: function() {
            return createTranslatedItemList("enum.laborAssignment.", aLaborAssignmentKeys, false);
        },
        getLaborAssignmentText: function(sValue) {
            return oResourceBundle.getText("enum.laborAssignment." + sValue);
        },

        /**
         * Creates an array of Day Types for Shifts keys with translated values.
         * @returns {array} array of objects in a format { key: <key>, text: <translated value> }
         */
        getDayTypeList: function() {
            return createTranslatedItemList("enum.dayType.", aDayTypeKeys, false);
        }
    };
});