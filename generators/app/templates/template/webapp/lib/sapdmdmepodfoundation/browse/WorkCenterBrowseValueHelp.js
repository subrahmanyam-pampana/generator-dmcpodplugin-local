sap.ui.define([
    "sap/ui/base/Object",
    "sap/dm/dme/podfoundation/browse/WorkCenterBrowse"
], function(BaseObject, WorkCenterBrowse) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.podfoundation.browse.WorkCenterBrowseValueHelp", {

        /**
         * Constructor
         *
         * @param {PluginViewController} oController - Plugin Controller.
         * @param {object} mSettings - Optional sSettings used in creation of browse
         */
        constructor: function(oController, mSettings) {
            this._oController = oController;
            this._mSettings = mSettings;
        },

        open: function(oEvent) {
            let oWorkCenterField = oEvent;
            if (oEvent.getSource) {
                oWorkCenterField = oEvent.getSource();
            }
            let oView = this.getView();

            let that = this;
            WorkCenterBrowse.open(oView, oWorkCenterField.getValue(), function(oSelectedObject) {
                this._handleWorkCenterBrowse(oWorkCenterField, oSelectedObject);
            }.bind(this));
        },

        _handleWorkCenterBrowse: function(oInputField, oSelectedObject) {
            this.processWorkCenterBrowseSelection(oInputField, oSelectedObject);
        },

        getView: function() {
            return this._oController.getView();
        },

        processWorkCenterBrowseSelection: function(oInputField, oSelectedObject) {
            return this._oController.processWorkCenterBrowseSelection(oInputField, oSelectedObject);
        }
    });
});