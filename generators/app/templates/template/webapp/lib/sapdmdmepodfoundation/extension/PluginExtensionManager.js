sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";

    /**
     * @class Class manages registered custom plugin extensions
     *
     * @alias sap.dm.dme.podfoundation.extension.PluginExtensionManager
     * @public
     * @extends sap.ui.base.Object
     */
    return BaseObject.extend("sap.dm.dme.podfoundation.extension.PluginExtensionManager", {
        constructor: function(oController) {
            this._oController = oController;
            this._oControllerExtensionsMap = {};
            this._oPropertyEditorExtensionsMap = {};
            this._bExtensionsLoaded = false;
        },

        /*
         * initializes the extensions once the POD Controller is defined
         *
         * @private
         */
        _initializePluginExtensions: function() {
            if (!this._bExtensionsLoaded) {
                var sPluginName = this._oController.getPluginName();
                var oPodController = this._oController.getPodController();
                if (oPodController) {
                    var oMap = oPodController.getControllerExtensionsMap();
                    if (oMap && oMap[sPluginName]) {
                        this._oControllerExtensionsMap = oMap[sPluginName];
                    }
                    oMap = oPodController.getPropertyEditorExtensionsMap();
                    if (oMap && oMap[sPluginName]) {
                        this._oPropertyEditorExtensionsMap = oMap[sPluginName];
                    }
                    this._bExtensionsLoaded = true;
                }
            }
        },

        /**
         * Returns the custom extension for the one defined by the core name
         *
         * @param {string} sExtensionName Name of extension to get custom extension for
         * @returns {ControllerExtension} Custom ControllerExtension
         * @public
         */
        findCustomControllerExtension: function(sExtensionName) {
            this._initializePluginExtensions();
            return this._oControllerExtensionsMap[sExtensionName];
        },

        /**
         * Returns the custom Property Editor extension for the one defined by the core name
         *
         * @param {string} sExtensionName Name of extension to get custom extension for
         * @returns {ControllerExtension} Custom ControllerExtension
         * @public
         */
        findCustomPropertyEditorExtension: function(sExtensionName) {
            this._initializePluginExtensions();
            return this._oPropertyEditorExtensionsMap[sExtensionName];
        }
    })
});