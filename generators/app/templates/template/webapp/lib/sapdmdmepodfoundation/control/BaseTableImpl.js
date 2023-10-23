/**
 * Provides class sap.dm.dme.control.BaseTableImpl.
 * This is base class for objects used for creating a Table using the TableFactory
 */
sap.ui.define([
    "sap/ui/base/Object",
    "../util/PodUtility"
], function(BaseObject, PodUtility) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.podfoundation.control.BaseTableImpl", {

        /**
         * @param oListConfiguration object containing list configuration
         * @param aListColumnData optional Array of column data overrides (see MobileTableImpl or GridTableImpl)
         * @param oResourceBundle jQuery.sap.util.ResourceBundle to get internationalized text
         */
        constructor: function(oListConfiguration, aListColumnData, oResourceBundle) {
            BaseObject.call(this);
            this._oListConfiguration = oListConfiguration;
            this._aListColumnData = aListColumnData;
            this._oResourceBundle = oResourceBundle;
        },

        _getColumnLabel: function(sColumn) {

            let sValue = "";
            if (this._aListColumnData && this._aListColumnData[sColumn]) {

                if (PodUtility.isNotEmpty(this._aListColumnData[sColumn].label)) {
                    sValue = this._aListColumnData[sColumn].label;
                } else {
                    if (!this._oResourceBundle) {
                        sValue = sColumn;
                    } else {
                        let sI18nKey = sColumn + ".LABEL";
                        let sI18nValue = this._oResourceBundle.getText(sI18nKey);
                        if (sI18nValue !== sI18nKey) {
                            sValue = sI18nValue;
                        }
                    }
                }
            }
            return sValue;
        },

        _getColumnWidth: function(sColumn) {
            if (this._aListColumnData && this._aListColumnData[sColumn] &&
                PodUtility.isNotEmpty(this._aListColumnData[sColumn].width) &&
                this._aListColumnData[sColumn].width !== "NONE" &&
                this._aListColumnData[sColumn].width !== "auto") {
                return this._aListColumnData[sColumn].width;
            }
            if (this._aListColumnData[sColumn] && this._aListColumnData[sColumn].width === "auto") {
                // return "auto" as is for column width
                return "auto";
            }
            if (!this._oResourceBundle) {
                // return empty string so width will not be used
                return "";
            }

            let sKey = sColumn + ".WIDTH";
            let sValue = this._oResourceBundle.getText(sKey);
            if (sValue === sKey) {
                // return empty string so width will not be used
                return "";
            }
            return sValue;
        },

        _getColumnBinding: function(sColumn) {
            if (this._aListColumnData && this._aListColumnData[sColumn] &&
                PodUtility.isNotEmpty(this._aListColumnData[sColumn].binding)) {
                return this._aListColumnData[sColumn].binding;
            }
            if (!this._oResourceBundle) {
                // return empty string so binding will not be used
                return "";
            }
            let sKey = sColumn + ".BINDING";
            let sValue = this._oResourceBundle.getText(sKey);
            if (sValue === sKey) {
                // return empty string so binding will not be used
                return "";
            }
            return sValue;
        }
    });
}, true);