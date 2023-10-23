sap.ui.define([
    "sap/ui/base/Object",
    "sap/dm/dme/podfoundation/extension/PluginExtensionType",
    "sap/dm/dme/podfoundation/util/PodUtility"
], function(BaseObject, PluginExtensionType, PodUtility) {
    "use strict";

    /**
     * @class Base class providing common functions to load registered custom plugin extensions
     *
     * @alias sap.dm.dme.podfoundation.extension.BaseExtensionsLoader
     * @public
     * @extends sap.ui.base.Object
     */
    return BaseObject.extend("sap.dm.dme.podfoundation.extension.BaseExtensionsLoader", {
        constructor: function() {
            this._oControllerExtensionsMap = {};
            this._oPropertyEditorExtensionsMap = {};
        },

        /**
         * Returns the map of controller extensions
         *
         * @returns {map} Map of controller extensions
         * @public
         */
        getControllerExtensionsMap: function() {
            return this._oControllerExtensionsMap;
        },

        /**
         * Sets the map of controller extensions
         *
         * @param {map} Map of controller extensions
         * @public
         */
        setControllerExtensionsMap: function(oMap) {
            this._oControllerExtensionsMap = oMap;
        },

        /**
         * Returns the map of property editor extensions
         *
         * @returns {map} Map of property editor extensions
         * @public
         */
        getPropertyEditorExtensionsMap: function() {
            return this._oPropertyEditorExtensionsMap;
        },

        /**
         * Sets the map of property editor extensions
         *
         * @param {map} Map of property editor extensions
         * @public
         */
        setPropertyEditorExtensionsMap: function(oMap) {
            this._oPropertyEditorExtensionsMap = oMap;
        },

        /*
         * Loads the custom plugin extensions from the provider
         *
         * @param {PluginExtensionProvider} oProvider Plugin Extension Provider
         * @private
         */
        loadPluginExtensions: function(sControllerName, oProvider) {
            let aCustomExtensions = oProvider.getExtensions();
            if (aCustomExtensions && aCustomExtensions.length > 0) {
                let aControllerMap = {};
                let aPropertyEditorMap = {};
                for (const oCustomExtension of aCustomExtensions) {
                    let sExtensionType = oCustomExtension.getExtensionType();
                    if (sExtensionType === PluginExtensionType.Controller) {
                        aControllerMap[oCustomExtension.getExtensionName()] = oCustomExtension;
                    } else if (sExtensionType === PluginExtensionType.PropertyEditor) {
                        aPropertyEditorMap[oCustomExtension.getExtensionName()] = oCustomExtension;
                    }
                }
                let oCMap = this.getControllerExtensionsMap();
                oCMap[sControllerName] = aControllerMap;
                this.setControllerExtensionsMap(oCMap);
                let oPMap = this.getPropertyEditorExtensionsMap();
                oPMap[sControllerName] = aPropertyEditorMap;
                this.setPropertyEditorExtensionsMap(oPMap);
            }
        },

        /*
         * Function checks the inclusion definitions for the extension to
         * see if it is valid for the current POD and Plant
         *
         * @param {object} oExtension Extension to check
         * @param {string} sCurrentPod Current POD executing
         * @param {string} sCurrentPlant Current Plant
         * @returns {boolean} true to be included, else false
         * @private
         */
        _isExtensionToBeIncluded: function(oExtension, sCurrentPod, sCurrentPlant) {
            if (!oExtension.inclusions || oExtension.inclusions.length === 0) {
                // no inclusions defined, do not include
                return false;
            }
            for (const oInclusion of oExtension.inclusions) {
                if (this._isInclusionMatchFound(oInclusion.pods, oInclusion.plants, sCurrentPod, sCurrentPlant)) {
                    // match found
                    return true;
                }
            }
            // no matches found
            return false;
        },

        /*
         * Function checks the inclusion POD's and Plants to
         * see if it is valid for the current POD and Plant.
         * <p>
         * A "match" is true if the current POD matches one of the POD's assigned
         * AND the current Plant matches one of the assigned plants.  If no POD's
         * are defined, then a match of the plants must exist.
         *
         * @param {array} List of POD's to check (can be empty)
         * @param {array} List of Plant's to check (can be empty)
         * @param {string} sCurrentPod Current POD executing
         * @param {string} sCurrentPlant Current Plant
         * @returns {boolean} true to be included, else false
         * @private
         */
        _isInclusionMatchFound: function(aPods, aPlants, sCurrentPod, sCurrentPlant) {
            if ((!aPods || aPods.length === 0) && (!aPlants || aPlants.length === 0)) {
                // A POD or Plant must be defined
                return false;
            }

            // check pod's first for a match
            let bMatchFound = false;
            if (aPods && aPods.length > 0) {
                for (const sCheckPodId of aPods) {
                    if (PodUtility.isMatching(sCheckPodId, sCurrentPod)) {
                        bMatchFound = true;
                        break;
                    }
                }
                if (!bMatchFound) {
                    // POD's defined but no match found'
                    return false;
                }
            }

            // check pod's first for a match
            if (aPlants && aPlants.length > 0) {
                bMatchFound = (aPlants.indexOf(sCurrentPlant) > -1);
            }

            return bMatchFound;
        },

        /*
         * Returns the custom Extension provider
         *
         * @param {string} sProviderName Name of custom Extension provider to register
         * @private
         */
        _getExtensionProvider: function(sProviderName) {
            return new Promise(function(resolve) {
                sap.ui.require([sProviderName],
                    function(ExtensionProvider) {
                        let oProvider = new ExtensionProvider();
                        resolve(oProvider);
                    },
                    function(oError) {
                        resolve(null);
                    });
            });
        }
    })
});