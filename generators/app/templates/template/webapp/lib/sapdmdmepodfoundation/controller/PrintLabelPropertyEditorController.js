sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";

    var ColumnPropertyEditorController = Controller.extend("sap.dm.dme.podfoundation.controller.PrintLabelPropertyEditorController", {
        beforeOpen: function(oEvent) {
            var oTable = this.getEditorTable();
            oTable.setModel(this._oTableModel);
        },

        getEditorTable: function() {
            // added for QUnit tests
            return sap.ui.getCore().byId("printLabelPropertyEditorDialog");
        },

        setTableModel: function(oTableModel) {
            this._oTableModel = oTableModel;
        },

        setCloseHandler: function(fnCloseHandler, oFnContext) {
            this._fnCloseHandler = fnCloseHandler;
            this._oFnContext = oFnContext;
        },

        _handlePrintLabelPropertyEditorDialogClose: function(oEvent) {
            var bEscPressed = false;
            if (oEvent && oEvent.escPressed) {
                bEscPressed = oEvent.escPressed;
            }
            var oTable = this.getEditorTable();
            var oModel = oTable.getModel();
            var oData = oModel.getData();
            var bSaveData = true;
            this._fnCloseHandler.call(this._oFnContext, oData, bSaveData);
        }
    });

    return ColumnPropertyEditorController;
});