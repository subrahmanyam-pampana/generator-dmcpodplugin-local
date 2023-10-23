sap.ui.define([
    "sap/dm/dme/podfoundation/extension/BasePluginExtension",
    "sap/dm/dme/podfoundation/extension/PluginExtensionType"
], function(BasePluginExtension, PluginExtensionType) {
    "use strict";

    /**
     * @class Base class for custom plugin property editor extensions.
     *
     * All plugin Property Editor extensions must {@link #.extend extend} from this base class.
     * This provides the ability to write custom extensions to core Property Editors
     *
     * @hideconstructor
     * @alias sap.dm.dme.podfoundation.extension.PluginPropertyEditorExtension
     * @public
     * @extends sap.dm.dme.podfoundation.extension.BasePluginExtension
     */
    var PluginPropertyEditorExtension = BasePluginExtension.extend("sap.dm.dme.podfoundation.extension.PluginPropertyEditorExtension", {
        metadata: {
            methods: {
                "addPropertyEditorContentBefore": {
                    "final": false,
                    "public": true
                },
                "addPropertyEditorContentAfter": {
                    "final": false,
                    "public": true
                },
                "getPropertyData": {
                    "final": false,
                    "public": true
                },
                "setPropertyData": {
                    "final": false,
                    "public": true
                },
                "getDefaultPropertyData": {
                    "final": false,
                    "public": true
                }
            }
        }
    });

    /**
     * Returns the name of the core extension you want to override.
     *
     * @returns {string} Name of extension to override
     * @public
     */
    PluginPropertyEditorExtension.prototype.getExtensionName = function() {
        return "propertyEditor";
    };

    /**
     * Returns the type of extension (i.e.; Controller, PropertyEditor or View)
     *
     * @returns {string} Type of extension (Property Editor)
     * @public
     */
    PluginPropertyEditorExtension.prototype.getExtensionType = function() {
        return PluginExtensionType.PropertyEditor;
    };

    /**
     * Function to override to add content before core properties
     *
     * @param {sap.ui.layout.form.SimpleForm} oPropertyFormContainer Form to add controls to
     * @param {object} oPropertyData Defined Property Data
     * @public
     */
    PluginPropertyEditorExtension.prototype.addPropertyEditorContentBefore = function(oPropertyFormContainer, oPropertyData) {
        // to be implemented by sub-classes
        return;
    };

    /**
     * Function to override to add content after core properties
     *
     * @param {sap.ui.layout.form.SimpleForm} oPropertyFormContainer Form to add controls to
     * @param {object} oPropertyData Defined Property Data
     * @public
     */
    PluginPropertyEditorExtension.prototype.addPropertyEditorContentAfter = function(oPropertyFormContainer, oPropertyData) {
        // to be implemented by sub-classes
        return;
    };

    /**
     * Function to override to add custom default property values to core property data
     *
     * @param {object} oPropertyData Defined Property Data
     * @returns {object} Updated Property Data
     * @public
     */
    PluginPropertyEditorExtension.prototype.getPropertyData = function(oPropertyData) {
        // to be implemented by sub-classes
        return oPropertyData;
    };

    /**
     * Function to override to add custom default property values to core property data
     *
     * @param {object} oPropertyData Defined Property Data
     * @returns {object} Updated Property Data
     * @public
     */
    PluginPropertyEditorExtension.prototype.setPropertyData = function(oPropertyData) {
        // to be implemented by sub-classes
        return oPropertyData;
    };

    /**
     * Function to override to add custom default property values
     *
     * @param {object} oPropertyData Defined Property Data
     * @returns {object} Updated Property Data
     * @public
     */
    PluginPropertyEditorExtension.prototype.getDefaultPropertyData = function(oPropertyData) {
        // to be implemented by sub-classes
        return oPropertyData;
    };

    return PluginPropertyEditorExtension;
});