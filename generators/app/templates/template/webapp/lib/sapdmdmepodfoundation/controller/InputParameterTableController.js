sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/dm/dme/i18n/i18nBundles"
], function(Controller, MessageBox, Bundles) {
    "use strict";

    var InputParameterTableController = Controller.extend("sap.dm.dme.podfoundation.controller.InputParameterTableController", {

        getEditorTable: function() {
            return sap.ui.getCore().byId("inputParameterTable");
        },

        setModels: function(oTableModel, oI18nModel) {
            this._oTableModel = oTableModel;
            this._oI18nModel = oI18nModel;
        },

        onAddInputParameter: function() {
            var iRows = this._oTableModel.getData().parameters.length;
            var oData = this._oTableModel.getData().parameters;
            if (iRows < 4) {
                oData.push({
                    id: iRows + 1,
                    name: "",
                    value: ""
                });
                this._oTableModel.setData({
                    parameters: oData
                });
                this.getEditorTable().setModel(this._oTableModel);
            } else {
                this.showErrorMessage(this._getI18nText("message.maxAllowedParams"));
            }
        },

        onRemoveParam: function(oEvent) {
            var oData = this._oTableModel.getData().parameters;
            var oItem = oEvent.getSource().getBindingContext("oTableModel").getObject();
            oData.splice(oItem.id - 1, 1);
            for (var i = 0; i < oData.length; i++) {
                oData[i].id = i + 1;
            }
            this._oTableModel.setData({
                parameters: oData
            });
            this.getEditorTable().setModel(this._oTableModel);
        },

        showErrorMessage: function(sMessage) {
            MessageBox.error(sMessage);
        },

        _getI18nText: function(sKey, aArgs) {
            return Bundles.getPropertyEditorText(sKey, aArgs);
        }
    });

    return InputParameterTableController;
});