sap.ui.define([
    "sap/dm/dme/podfoundation/extension/BaseExtensionsLoader",
    "sap/dm/dme/util/PlantSettings"
], function(BaseExtensionsLoader, PlantSettings) {
    "use strict";

    /**
     * @class Class manages registered custom property editor extensions
     *
     * @alias sap.dm.dme.podfoundation.control.PropertyEditorExtensionLoader
     * @public
     * @extends sap.ui.base.Object
     */
    return BaseExtensionsLoader.extend("sap.dm.dme.podfoundation.control.PropertyEditorExtensionLoader", {
        constructor: function(oController) {
            this._oController = oController;
            BaseExtensionsLoader.apply(this, arguments);
        },

        /**
         * Returns the custom Property Editor extension for the one defined by the core name
         *
         * @param {string} sExtensionName Name of extension to get custom extension for
         * @returns {ControllerExtension} Custom ControllerExtension
         * @public
         */
        findCustomPropertyEditorExtension: function(sExtensionName) {
            var oMap = this.getPropertyEditorExtensionsMap();
            var sName = this._oController.getName();
            var oPropertyMap = oMap[sName];
            if (!oPropertyMap) {
                return null;
            }
            return oPropertyMap[sExtensionName];
        },

        /**
         * Registers all custom ControllerExtension's to this controller
         *
         * @param {string} sControllerName Name of controller to register extensions for
         * @public
         */
        registerCustomExtensions: function(sControllerName) {
            var that = this;
            return new Promise(function(resolve) {
                var aExtensions = that._findControllerExtensions(sControllerName);
                if (!aExtensions || aExtensions.length === 0) {
                    resolve();
                }
                for (var i = 0; i < aExtensions.length; i++) {
                    var index = i;
                    that._getExtensionProvider(aExtensions[i].provider)
                        .then(function(oProvider) {
                            if (oProvider) {
                                this.loadPluginExtensions(sControllerName, oProvider);
                            }
                            if (index === aExtensions.length - 1) {
                                resolve();
                            }
                        }.bind(that));
                }
            });
        },

        /*
         * Function finds all ControllerExtensions for input named controller
         *
         * @param {string} sControllerName Name of controller to get extensions for
         * @returns {array} List of sap.ui.core.mvc.ControllerExtensions
         * @private
         */
        _findControllerExtensions: function(sControllerName) {
            var aFoundExtensions = [];
            var oPodController = this._getPodController();
            if (oPodController) {
                var sCurrentPlant = PlantSettings.getCurrentPlant();
                var sCurrentPod = oPodController.getPodId();
                var aExtensions = oPodController.getPluginExtensions();
                if (aExtensions && aExtensions.length > 0) {
                    for (const oExtension of aExtensions) {
                        if (oExtension.controller === sControllerName &&
                            this._isExtensionToBeIncluded(oExtension, sCurrentPod, sCurrentPlant)) {
                            aFoundExtensions[aFoundExtensions.length] = oExtension;
                        }
                    }
                }
            }
            return aFoundExtensions;
        },

        /*
         * Returns the instance of the controller the core extension is defined to
         *
         * @returns {object} Instance of core controller
         * @private
         */
        _getController: function() {
            return this._oController;
        },

        /*
         * Returns the custom Extension provider
         *
         * @param {string} sProviderName Name of custom Extension provider to register
         * @private
         */
        _getPodController: function() {
            var oController = this._getController();
            var oPodController = null;
            if (oController && oController.getMainControllerHelper) {
                var oHelper = oController.getMainControllerHelper();
                if (oHelper) {
                    oPodController = oHelper.getPodConfigurationHelper();
                }
            }
            return oPodController;
        }
    })
});