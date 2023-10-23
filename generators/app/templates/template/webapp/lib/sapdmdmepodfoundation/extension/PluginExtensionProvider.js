sap.ui.define([
    'sap/ui/base/Object'
], function(BaseObject) {
    "use strict";

    /**
     * @class Base class for provider of custom plugin extensions.
     *
     * The sub-class must implement the getExtensions() function and return the list
     * of custom plugin extension objects
     *
     * @hideconstructor
     * @alias sap.dm.dme.podfoundation.extension.PluginExtensionProvider
     * @public
     * @extends sap.ui.base.Object
     */
    var PluginExtensionProvider = BaseObject.extend("sap.dm.dme.podfoundation.extension.PluginExtensionProvider", {
        metadata: {
            methods: {
                "getExtensions": {
                    "final": false,
                    "public": true
                }
            }
        }
    });

    /**
     * Returns the list of extensions to override
     * This must be implemented by sub-class
     *
     * @returns {array} List of extensions
     * @public
     */
    PluginExtensionProvider.prototype.getExtensions = function() {
        // to be implemented by sub-class
        return null;
    };

    return PluginExtensionProvider;
});