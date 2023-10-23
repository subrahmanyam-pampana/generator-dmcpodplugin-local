sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/dm/dme/i18n/i18nBundles",
    "sap/dm/dme/message/ErrorHandler",
    "sap/dm/dme/podfoundation/service/ListMaintenanceService"
], function(Controller, MessageBox, Bundles, ErrorHandler, ListMaintenanceService) {
    "use strict";

    var oBaseListMaintenanceController = Controller.extend("sap.dm.dme.podfoundation.controller.BaseListMaintenanceController", {

        setMainView: function(oMainView) {
            this._oMainView = oMainView;
        },

        getMainView: function(g) {
            return this._oMainView;
        },

        setListType: function(sListType) {
            this._sListType = sListType;
        },

        getListType: function() {
            return this._sListType;
        },

        getI18nText: function(sKey, aArgs) {
            return Bundles.getPropertyEditorText(sKey, aArgs);
        },

        getListMaintenanceI18nText: function(sKey, aArgs) {
            return Bundles.getListMaintenanceText(sKey, aArgs);
        },

        getGlobalI18nText: function(sKey, aArgs) {
            return Bundles.getGlobalText(sKey, aArgs);
        },

        showErrorMessage: function(sMessage) {
            // added to support QUnit tests
            MessageBox.error(sMessage);
        },

        showAjaxErrorMessage: function(sDefaultMessage, oError) {
            var sErrorMessage = ErrorHandler.getErrorMessage(oError);
            if (!jQuery.trim(sErrorMessage)) {
                sErrorMessage = sDefaultMessage;
            }
            this.showErrorMessage(sErrorMessage);
        },

        getListMaintenanceService: function() {
            if (!this._oListMaintenanceService) {
                var oMainController = this.getMainView().getController();
                var sPodFoundationUri = this.getPodFoundationDataSourceUri(oMainController);
                var sPlantUri = this.getPlantODataSourceUri(oMainController);
                this._oListMaintenanceService = new ListMaintenanceService(sPodFoundationUri, sPlantUri);
            }
            return this._oListMaintenanceService;
        },

        getPodFoundationDataSourceUri: function() {
            var oMainController = this.getMainView().getController();
            return oMainController.getOwnerComponent().getDataSourceUriByName("podFoundation-RestSource");
        },

        getProductionDataSourceUri: function() {
            var oMainController = this.getMainView().getController();
            return oMainController.getOwnerComponent().getDataSourceUriByName("production-RestSource");
        },

        getPlantODataSourceUri: function() {
            var oMainController = this.getMainView().getController();
            return oMainController.getOwnerComponent().getDataSourceUriByName("plant-oDataSource");
        }
    });

    return oBaseListMaintenanceController;
});