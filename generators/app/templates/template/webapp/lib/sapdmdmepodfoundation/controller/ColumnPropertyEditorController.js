sap.ui.define([
    "sap/ui/core/library",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/ValueState",
    "sap/dm/dme/i18n/i18nBundles",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(coreLibrary, Controller, ValueState, Bundles, PodUtility) {
    "use strict";

    return Controller.extend("sap.dm.dme.podfoundation.controller.ColumnPropertyEditorController", {
        beforeOpen: function() {
            let oTable = this.getEditorTable();
            oTable.setModel(this._oTableModel);
        },

        getEditorTable: function() {
            // added for QUnit tests
            return sap.ui.getCore().byId("columnPropertyEditorTable");
        },

        setTableModel: function(oTableModel) {
            this._oTableModel = oTableModel;
        },

        setCloseHandler: function(fnCloseHandler, oFnContext) {
            this._fnCloseHandler = fnCloseHandler;
            this._oFnContext = oFnContext;
        },

        _handleColumnPropertyEditorDialogClose: function(oEvent) {
            let bEscPressed = false;
            if (oEvent && oEvent.escPressed) {
                bEscPressed = oEvent.escPressed;
            }
            let oTable = this.getEditorTable();
            let oModel = oTable.getModel();
            let oData = oModel.getData();
            let bSaveData = true;
            if (!this._validateColumnPropertyValues(oData)) {
                if (!bEscPressed) {
                    return;
                } else {
                    bSaveData = false;
                }
            }
            this._fnCloseHandler.call(this._oFnContext, oData, bSaveData);
        },

        _validateColumnPropertyValues: function(oData) {
            if (!oData || !oData.ColumnConfiguration || oData.ColumnConfiguration.length === 0) {
                return true;
            }
            for (let oColumn of oData.ColumnConfiguration) {
                if (PodUtility.isNotEmpty(oColumn.width)) {
                    if (!this._isValidCSS("width", oColumn.width)) {
                        return false;
                    }
                }
                if (PodUtility.isNotEmpty(oColumn.minScreenWidth)) {
                    if (!this._validateMinimumScreenSize(oColumn.minScreenWidth)) {
                        return false;
                    }
                }
                delete oColumn.hAlignValue;
                delete oColumn.vAlignValue;
            }
            return true;
        },

        _validateMinimumScreenSize: function(sValue) {
            if (PodUtility.isEmpty(sValue)) {
                return true;
            }
            if (!this._isValidCSS("width", sValue) &&
                sValue !== "Phone" && sValue !== "Desktop" && sValue !== "Tablet" &&
                sValue !== "Large" && sValue !== "Medium" && sValue !== "Small" &&
                sValue !== "XLarge" && sValue !== "XXLarge" && sValue !== "XSmall" &&
                sValue !== "XXSmall") {
                return false;
            }
            return true;
        },

        _onWidthChange: function(oEvent) {
            let oInput = oEvent.getSource();
            if (!oInput) {
                return;
            }
            let sValue = oInput.getValue();

            if (PodUtility.isNotEmpty(sValue) && !this._isValidCSS("width", sValue)) {
                oInput.setValueState(ValueState.Error);
                let sMessage = this._getI18nText("message.invalidColumnWidthValueInput");
                oInput.setValueStateText(sMessage);
                oInput.focus();
                return false;
            }
            oInput.setValueState(ValueState.None);
            oInput.setValueStateText(null);
            return true;
        },

        _onMinScreenWidthChange: function(oEvent) {
            let oInput = oEvent.getSource();
            if (!oInput) {
                return;
            }
            let sValue = oInput.getValue();

            if (PodUtility.isNotEmpty(sValue) && !this._validateMinimumScreenSize(sValue)) {
                oInput.setValueState(ValueState.Error);
                let sMessage = this._getI18nText("message.invalidMinScreenWidthValueInput");
                oInput.setValueStateText(sMessage);
                oInput.focus();
                return false;
            }
            oInput.setValueState(ValueState.None);
            oInput.setValueStateText(null);
            return true;
        },

        _isValidCSS: function(sProperty, sCSS) {
            return coreLibrary.CSSSize.isValid(sCSS) && !this._isNumber(sCSS) && !this._endsWith(sCSS, "%");
        },

        _isNumber: function(sText) {
            if (PodUtility.isEmpty(sText)) {
                return false;
            }
            if (typeof sText === "number" || !isNaN(sText)) {
                return true;
            }
            return false;
        },

        _endsWith: function(sString, sSearch) {
            if (PodUtility.isEmpty(sString) || PodUtility.isEmpty(sSearch)) {
                return false;
            }
            let index = sString.length;
            return sString.substring(index - sSearch.trim().length, index) === sSearch.trim();
        },

        _getI18nText: function(sKey, aArgs) {
            return Bundles.getPropertyEditorText(sKey, aArgs);
        }
    });
});