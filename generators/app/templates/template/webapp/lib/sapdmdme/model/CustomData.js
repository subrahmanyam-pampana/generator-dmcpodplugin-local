/* global Promise */
sap.ui.define([
    "sap/ui/base/Object",
    "sap/dm/dme/model/AjaxUtil",
    "sap/ui/model/json/JSONModel",
    "sap/dm/dme/util/ServiceErrorAlert"
], function(BaseObject, AjaxUtil, JSONModel, ServiceErrorAlert) {
    "use strict";
    let CUSTOM_DATA_MODEL = "customData";
    return BaseObject.extend("sap.dm.dme.model.CustomData", {
        _fnOnError: null,

        /**
         * Creates an object that represents custom field definitions
         * combined with values for the operated object.
         * Makes request to fetch Custom Field Definitions.
         *
         * @param {string} sServiceUrl Url to the backend service
         * @param {string} sTableName Name of the table that corresponds with the operated object
         * @param {object} oView View that contains 'customDataTable' control
         */
        constructor: function(sServiceUrl, sTableName, oView, fnOnError) {
            this._fnOnError = fnOnError;
            const that = this;
            let oCustomDataTable = oView.byId("customDataTable");
            if (oCustomDataTable) {
                this._oCustomDataTable = oCustomDataTable;
                let sUrl = sServiceUrl + "CustomFieldDefinitions";
                let sParameters = "$filter=tableName eq '" + sTableName + "'&$orderby=sequence&$select=fieldName,fieldLabel";
                oCustomDataTable.setModel(new JSONModel(), CUSTOM_DATA_MODEL);
                oCustomDataTable.setBusy(true);

                this._oLoading = new Promise(function(fnResolve) {
                    AjaxUtil.get(sUrl, sParameters, function(oData) {
                        oCustomDataTable.setBusy(false);
                        fnResolve(oData.value);
                    }, function(oError, oHttpErrorMessage, nStatus) {
                        oCustomDataTable.setBusy(false);
                        that._processError(oError, oHttpErrorMessage, nStatus);
                    });
                });
            }
        },

        _processError: function(oError, oHttpErrorMessage, nStatus) {
            if (this._fnOnError) {
                this._fnOnError(oError, oHttpErrorMessage, nStatus);
            } else {
                sap.m.MessageBox.error(oError.error.message || oHttpErrorMessage);
            }
        },

        /**
         * Adds object's custom values to the custom data.
         *
         * @param {Array} aCustomValues Custom values for the object on Read, undefined on Create
         */
        setCustomValues: function(aCustomValues) {
            this._oLoading.then(function(aCustomFields) {
                let aCustomData = this._mergeCustomFieldsWithValues(aCustomFields, aCustomValues || []);
                this._oCustomDataTable.getModel(CUSTOM_DATA_MODEL).setData(aCustomData);
            }.bind(this));
        },

        /**
         * Returns array of custom values for the object.
         *
         * @returns {Array} Array of custom values to be added to payload
         */
        getCustomValues: function() {
            let aCustomData = this._oCustomDataTable.getModel(CUSTOM_DATA_MODEL).getData();
            return this._extractCustomValues(aCustomData);
        },

        /**
         * Merges custom field definitions with custom values.
         *
         * @param {Array} aCustomFields Custom fields definitions
         * @param {Array} aCustomValues Custom values
         * @returns {Array} Array of custom data
         * @private
         */
        _mergeCustomFieldsWithValues: function(aCustomFields, aCustomValues) {
            aCustomFields.forEach(function(oCustomField) {
                let sValue = null;
                aCustomValues.some(function(oCustomValue) {
                    if (oCustomValue.attribute === oCustomField.fieldName) {
                        sValue = oCustomValue.value;
                    }
                    return sValue;
                });
                oCustomField.value = sValue;
            });
            return aCustomFields;
        },

        /**
         * Extracts custom values from custom data
         *
         * @param {Array} aCustomData Custom data for the object
         * @returns {Array} Custom values for the object
         * @private
         */
        _extractCustomValues: function(aCustomData) {
            let aCustomValues = [];
            aCustomData.forEach(function(oCustomData) {
                if (oCustomData.value) {
                    aCustomValues.push({
                        attribute: oCustomData.fieldName,
                        value: oCustomData.value
                    });
                }
            });
            return aCustomValues;
        }

    });
});