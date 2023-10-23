sap.ui.define([
    "sap/ui/base/Object",
    "sap/dm/dme/podfoundation/browse/WorkCenterResourceBrowse"
], function(BaseObject, WorkCenterResourceBrowse) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.podfoundation.browse.WorkCenterResourceBrowseValueHelp", {

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

        open: function(oEvent, aWorkCenterResourceItems) {
            let oResourceField = oEvent;
            if (oEvent.getSource) {
                oResourceField = oEvent.getSource();
            }
            let oView = this.getView();

            let that = this;

            // Open the WorkCenterResourceBrowse Dialog
            WorkCenterResourceBrowse.open(oView, oResourceField.getValue(), aWorkCenterResourceItems, function(oSelectedObject) {
                that._handleWorkCenterResourceBrowse(oResourceField, oSelectedObject);
            });
        },

        _handleWorkCenterResourceBrowse: function(oInputField, oSelectedObject) {
            this.processWorkCenterResourceBrowseSelection(oInputField, oSelectedObject);
        },

        getView: function() {
            return this._oController.getView();
        },

        processWorkCenterResourceBrowseSelection: function(oInputField, oSelectedObject) {
            return this._oController.processWorkCenterResourceBrowseSelection(oInputField, oSelectedObject);
        }
    });
});