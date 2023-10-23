sap.ui.define([
    "sap/dm/dme/podfoundation/extension/BasePluginExtension",
    "sap/ui/core/mvc/OverrideExecution",
    "sap/dm/dme/podfoundation/extension/PluginExtensionType",
    "sap/base/Log"
], function(BasePluginExtension, OverrideExecution, PluginExtensionType, Log) {
    "use strict";

    /**
     * @class Base class for custom plugin extensions.
     *
     * All plugin extensions must {@link #.extend extend} from this base class.
     * This provides the ability to write custom extensions to core extensions
     * defined for the core plugin controller, property editor and view
     *
     * @hideconstructor
     * @alias sap.dm.dme.podfoundation.extension.PluginControllerExtension
     * @public
     * @extends sap.dm.dme.podfoundation.extension.BasePluginExtension
     */
    let PluginControllerExtension = BasePluginExtension.extend("sap.dm.dme.podfoundation.extension.PluginControllerExtension", {
        metadata: {
            methods: {
                "isOverridingFunction": {
                    "final": true,
                    "public": true
                },
                "isExecutionBefore": {
                    "final": true,
                    "public": true
                },
                "isExecutionAfter": {
                    "final": true,
                    "public": true
                },
                "executeFunction": {
                    "final": true,
                    "public": true
                }
            }
        }
    });

    /*
     * Returns the Controller type of extension
     *
     * @returns {string} Type of extension (Controller)
     * @override
     */
    PluginControllerExtension.prototype.getExtensionType = function() {
        return PluginExtensionType.Controller;
    };

    /**
     * Returns whether or not this extension overrides the core member function
     *
     * @param {string} sOverrideMember Name of member function
     * @returns {boolean} Return true if overriding named member function, else false
     * @public
     */
    PluginControllerExtension.prototype.isOverridingFunction = function(sOverrideMember) {
        return this._isCustomOverridingByExecutionType(sOverrideMember, OverrideExecution.Instead);
    };

    /**
     * Returns whether or not this extension is called before the core member function
     *
     * @param {string} sOverrideMember Name of member function
     * @returns {boolean} Return true if this extensions named member function is called before core one, else false
     * @public
     */
    PluginControllerExtension.prototype.isExecutionBefore = function(sOverrideMember) {
        return this._isCustomOverridingByExecutionType(sOverrideMember, OverrideExecution.Before);
    };

    /**
     * Returns whether or not this extension is called after the core member function
     *
     * @param {string} sOverrideMember Name of member function
     * @returns {boolean} Return true if this extensions named member function is called after core one, else false
     * @public
     */
    PluginControllerExtension.prototype.isExecutionAfter = function(sOverrideMember) {
        return this._isCustomOverridingByExecutionType(sOverrideMember, OverrideExecution.After);
    };

    /*
     * helper function that returns whether the member function is being overridden for the input OverrideExecution type
     *
     * @param {string} sOverrideMember Name of member function
     * @param {string} sOverrideExecutionType OverrideExecution type (Instead, Before, After)
     * @returns {boolean} Return true if this extensions named member function is called after core one, else false
     * @private
     */
    PluginControllerExtension.prototype._isCustomOverridingByExecutionType = function(sOverrideMember, sOverrideExecutionType) {
        if (this._isFunctionFinal(sOverrideMember)) {
            return false;
        }
        let oCustomMetadata = null;
        if (this.getMetadata) {
            oCustomMetadata = this.getMetadata();
        }
        if (!oCustomMetadata || !this.hasOverride(sOverrideMember)) {
            return false;
        }
        let sOverrideExecution = this.getOverrideExecution(sOverrideMember);
        if (!sOverrideExecution) {
            return false;
        }
        if (sOverrideExecution === sOverrideExecutionType) {
            return true;
        }
        return false;
    };

    /**
     * Executes the custom extensions member fuction, passing arguments
     *
     * @param {string} sOverrideMember Name of member function
     * @param {list} aArgs List of arguments for function
     * @returns {object} Return object based on member function
     * @public
     */
    PluginControllerExtension.prototype.executeFunction = function(sOverrideMember, aArgs) {
        this._logCall(sOverrideMember);
        return this[sOverrideMember].apply(this, aArgs);
    };

    /*
     * internal function returns whether or not the core extension member fuction is defined as final
     * (i.e.; cannot be overridden)
     *
     * @param {string} sOverrideMember Name of member function
     * @returns {boolean} Return true if core extensions named member function is final, else false
     * @private
     */
    PluginControllerExtension.prototype._isFunctionFinal = function(sOverrideMember) {
        if (!this._oCoreExtension) {
            return true;
        }
        let oOrigExtensionMetadata = this._oCoreExtension.getMetadata();
        if (!oOrigExtensionMetadata) {
            return true;
        }
        return oOrigExtensionMetadata.isMethodFinal(sOverrideMember);
    };

    /**
     * Returns whether or not this extensions named member function exists
     *
     * @param {string} sOverrideMember Name of member function
     * @returns {boolean} true if member function exists in extension
     * @public
     */
    PluginControllerExtension.prototype.hasOverride = function(sOverrideMember) {
        if (this[sOverrideMember]) {
            return true;
        }
        return false;
    };

    /**
     * Returns the type of OverrideExecution the named member function is used for
     * This must be implemented by sub-class
     *
     * @param {string} sOverrideMember Name of member function
     * @returns {sap.ui.core.mvc.OverrideExecution} (Instead, Before or After)
     * @public
     */
    PluginControllerExtension.prototype.getOverrideExecution = function(sOverrideMember) {
        // to be overridden by sub-class
        return null;
    };

    /**
     * Returns the logger for this extension
     *
     * @returns {sap/base/Log} instance of Log specific to this extension
     * @public
     */
    PluginControllerExtension.prototype.getLogger = function() {
        if (!this._oLogger) {
            let sCoreExtension = "";
            let oCoreExtension = this.getCoreExtension();
            if (oCoreExtension) {
                sCoreExtension = oCoreExtension.getMetadata().getName();
            }
            this._oLogger = Log.getLogger(sCoreExtension, Log.Level.INFO);
        }
        return this._oLogger;
    };

    /*
     * Logs info on the current running extension
     */
    PluginControllerExtension.prototype._logCall = function(sOverrideMember) {
        let sCustomExtension = "";
        let oCustomExtension = this;
        if (oCustomExtension) {
            sCustomExtension = oCustomExtension.getMetadata().getName();
        }
        let sOverrideType = "";
        if (this.isOverridingFunction(sOverrideMember)) {
            sOverrideType = OverrideExecution.Instead;
        } else if (this.isExecutionBefore(sOverrideMember)) {
            sOverrideType = OverrideExecution.Before;
        } else if (this.isExecutionAfter(sOverrideMember)) {
            sOverrideType = OverrideExecution.After;
        }
        let sMessage = `Calling Extension: ${sCustomExtension}.${sOverrideMember}, Type: ${sOverrideType}`;
        this.getLogger().info(sMessage);
    };

    return PluginControllerExtension;
});