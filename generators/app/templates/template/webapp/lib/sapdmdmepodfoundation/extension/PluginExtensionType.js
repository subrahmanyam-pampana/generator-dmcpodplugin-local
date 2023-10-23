sap.ui.define(function() {
    "use strict";
    /**
     * Plugin Extension Type defined by a <code>PluginExtension</code>.
     *
     * @enum {string}
     * @public
     * @alias sap.dm.dme.podfoundation.extension.PluginExtensionType
     * @see sap.dm.dme.podfoundation.extension.PluginExtension
     */
    return {
        /**
         * The extension type defines a Controller extension
         * This is the default type extension
         * @public
         */
        Controller: "Controller",

        /**
         * The extension type defines a Property Editor extension
         * @public
         */
        PropertyEditor: "PropertyEditor"
    };
}, /* bExport= */ true);