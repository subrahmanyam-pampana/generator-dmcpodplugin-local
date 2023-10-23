sap.ui.define([
    "sap/ui/base/Object",
    "sap/dm/dme/podfoundation/browse/ResourceBrowse"
], function(BaseObject, ResourceBrowse) {
    "use strict";

    return BaseObject.extend("sap.dm.dme.podfoundation.browse.ResourceBrowseValueHelp", {

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
            let oResourceField = oEvent;
            if (oEvent.getSource) {
                oResourceField = oEvent.getSource();
            }
            let oView = this.getView();

            let that = this;
            ResourceBrowse.open(oView, oResourceField.getValue(), function(oSelectedObject) {
                that._handleResourceBrowse(oResourceField, oSelectedObject);
            });
        },

        _handleResourceBrowse: function(oInputField, oSelectedObject) {
            this.processResourceBrowseSelection(oInputField, oSelectedObject);
        },

        getView: function() {
            return this._oController.getView();
        },

        processResourceBrowseSelection: function(oInputField, oSelectedObject) {
            return this._oController.processResourceBrowseSelection(oInputField, oSelectedObject);
        }
    });
});