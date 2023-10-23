sap.ui.define([
    "sap/ui/base/Object"
], function(BaseObject) {
    "use strict";

    /**
     * @class Base class for all custom plugin extensions.
     *
     * All base plugin extensions {@link #.extend extend} from this base class.
     * This provides the ability to write custom extensions to core extensions
     * defined for the core plugin controller, property editor and view
     *
     * @hideconstructor
     * @alias sap.dm.dme.podfoundation.extension.BasePluginExtension
     * @public
     * @extends sap.ui.base.Object
     */
    var BasePluginExtension = BaseObject.extend("sap.dm.dme.podfoundation.extension.BasePluginExtension", {
        metadata: {
            methods: {
                "getExtensionName": {
                    "final": false,
                    "public": true
                },
                "getExtensionType": {
                    "final": false,
                    "public": true
                },
                "setController": {
                    "final": true,
                    "public": true
                },
                "setCoreExtension": {
                    "final": true,
                    "public": true
                }
            }
        }
    });

    /**
     * Returns the name of the core extension you want to override.
     * This must be implemented by sub-class
     *
     * @returns {string} Name of extension to override
     * @public
     */
    BasePluginExtension.prototype.getExtensionName = function() {
        return null;
    };

    /**
     * Returns the type of extension (i.e.; Controller, PropertyEditor or View)
     *
     * @returns {string} Type of extension
     * @public
     */
    BasePluginExtension.prototype.getExtensionType = function() {
        // to be implemented by sub-classes
        return null;
    };

    /**
     * Sets the instance of the controller the core extension is defined to
     *
     * @param {object} Instance of core controller
     * @public
     */
    BasePluginExtension.prototype.setController = function(oController) {
        this._oController = oController;
    };

    /**
     * Returns the instance of the controller the core extension is defined to
     *
     * @returns {object} Instance of core controller
     * @public
     */
    BasePluginExtension.prototype.getController = function() {
        return this._oController;
    };

    /**
     * Sets the instance of the core extension being overriden
     *
     * @param {object} oCoreExtension Instance of core extension
     * @public
     */
    BasePluginExtension.prototype.setCoreExtension = function(oCoreExtension) {
        this._oCoreExtension = oCoreExtension;
    };

    /**
     * Returns the instance of the core extension being overriden
     *
     * @returns {object} Instance of core extension
     * @public
     */
    BasePluginExtension.prototype.getCoreExtension = function() {
        return this._oCoreExtension;
    };

    return BasePluginExtension;
});