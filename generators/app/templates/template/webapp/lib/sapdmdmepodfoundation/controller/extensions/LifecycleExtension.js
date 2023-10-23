sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/dm/dme/podfoundation/controller/extensions/LifecycleExtensionConstants"
], function(ControllerExtension, Constants) {
    "use strict";

    /**
     * Base Constructor for a plugin Lifecycle Extension
     * The following functions can be overridden by custom extensions:
     *<pre>
     *    onBeforeRendering()
     *    onBeforeRenderingPlugin()
     *    onAfterRendering()
     *    onExit()
     * </pre>
     * Core Plugin controllers using this class must implement the following public methods
     * in order to implement core plugin functionality:
     * <pre>
     *    handleOnBeforeRendering()
     *    handleOnBeforeRenderingPlugin()
     *    handleOnAfterRendering()
     *    handleOnExit()
     * </pre>
     * The onInit() function is not supported to be overridden.
     * @class
     * <code>sap.dm.dme.podfoundation.controller.extensions.LifecycleExtension</code> provides
     * functions that handle ui5 lifecycle events.  Custom extensions can be created to
     * override or modify core behaviour.
     *
     * @extends sap.ui.core.mvc.ControllerExtension
     *
     * @constructor
     * @public
     * @alias sap.dm.dme.podfoundation.controller.extensions.LifecycleExtension
     */
    let LifecycleExtension = ControllerExtension.extend("sap.dm.dme.podfoundation.controller.extensions.LifecycleExtension", {
        metadata: {
            methods: {
                onBeforeRendering: {
                    "final": false,
                    "public": true
                },
                onBeforeRenderingPlugin: {
                    "final": false,
                    "public": true
                },
                onAfterRendering: {
                    "final": false,
                    "public": true
                },
                onExit: {
                    "final": false,
                    "public": true
                }
            }
        }
    });

    /**
     * Overridden to set the Order List view model and initialize the Table.  This function
     * can be overriden by custom extensions as follows for OverrideExecution.Instead,
     * OverrideExecution.Before and OverrideExecution.After.
     *
     * @see sap.dm.dme.podfoundation.controller.PluginViewController#onBeforeRendering
     * @public
     */
    LifecycleExtension.prototype.onBeforeRendering = function() {
        let oCustomExtension = this._getCustomExtension();
        if (oCustomExtension) {
            if (oCustomExtension.isOverridingFunction(Constants.ON_BEFORE_RENDERING)) {
                oCustomExtension.executeFunction(Constants.ON_BEFORE_RENDERING, null);
                return;
            }
            if (oCustomExtension.isExecutionBefore(Constants.ON_BEFORE_RENDERING)) {
                oCustomExtension.executeFunction(Constants.ON_BEFORE_RENDERING, null);
            }
        }
        if (this.base.handleOnBeforeRendering) {
            this.base.handleOnBeforeRendering();
        }
        if (oCustomExtension && oCustomExtension.isExecutionAfter(Constants.ON_BEFORE_RENDERING)) {
            oCustomExtension.executeFunction(Constants.ON_BEFORE_RENDERING);
        }
    };

    /**
     * This function creates the event subscriptions and makes
     * call to create the initial list table.  This function
     * can be overriden by custom extensions as follows for OverrideExecution.Instead,
     * OverrideExecution.Before and OverrideExecution.After.
     *
     * @see sap.dm.dme.podfoundation.controller.PluginViewController#onBeforeRenderingPlugin
     * @public
     */
    LifecycleExtension.prototype.onBeforeRenderingPlugin = function() {
        let oCustomExtension = this._getCustomExtension();
        if (oCustomExtension) {
            if (oCustomExtension.isOverridingFunction(Constants.ON_BEFORE_RENDERING_PLUGIN)) {
                oCustomExtension.executeFunction(Constants.ON_BEFORE_RENDERING_PLUGIN, null);
                return;
            }
            if (oCustomExtension.isExecutionBefore(Constants.ON_BEFORE_RENDERING_PLUGIN)) {
                oCustomExtension.executeFunction(Constants.ON_BEFORE_RENDERING_PLUGIN, null);
            }
        }
        if (this.base.handleOnBeforeRenderingPlugin) {
            this.base.handleOnBeforeRenderingPlugin();
        }
        if (oCustomExtension && oCustomExtension.isExecutionAfter(Constants.ON_BEFORE_RENDERING_PLUGIN)) {
            oCustomExtension.executeFunction(Constants.ON_BEFORE_RENDERING_PLUGIN);
        }
    };

    /**
     * Overridden to set internal flags for handling defaults.  This function
     * can be overriden by custom extensions as follows for OverrideExecution.Instead,
     * OverrideExecution.Before and OverrideExecution.After.
     *
     * @see sap.dm.dme.podfoundation.controller.PluginViewController#onAfterRendering
     * @public
     */
    LifecycleExtension.prototype.onAfterRendering = function() {
        let oCustomExtension = this._getCustomExtension();
        if (oCustomExtension) {
            if (oCustomExtension.isOverridingFunction(Constants.ON_AFTER_RENDERING)) {
                oCustomExtension.executeFunction(Constants.ON_AFTER_RENDERING, null);
                return;
            }
            if (oCustomExtension.isExecutionBefore(Constants.ON_AFTER_RENDERING)) {
                oCustomExtension.executeFunction(Constants.ON_AFTER_RENDERING, null);
            }
        }
        if (this.base.handleOnAfterRendering) {
            this.base.handleOnAfterRendering();
        }
        if (oCustomExtension && oCustomExtension.isExecutionAfter(Constants.ON_AFTER_RENDERING)) {
            oCustomExtension.executeFunction(Constants.ON_AFTER_RENDERING);
        }
    };

    /**
     * This function by unsubscribes the events and destroys the table.  This function
     * can be overriden by custom extensions as follows for OverrideExecution.Instead,
     * OverrideExecution.Before and OverrideExecution.After.
     *
     * @see sap.dm.dme.podfoundation.controller.PluginViewController#onExit
     * @public
     */
    LifecycleExtension.prototype.onExit = function() {
        let oCustomExtension = this._getCustomExtension();
        if (oCustomExtension) {
            if (oCustomExtension.isOverridingFunction(Constants.ON_EXIT)) {
                oCustomExtension.executeFunction(Constants.ON_EXIT, null);
                return;
            }
            if (oCustomExtension.isExecutionBefore(Constants.ON_EXIT)) {
                oCustomExtension.executeFunction(Constants.ON_EXIT, null);
            }
        }
        if (this.base.handleOnExit) {
            this.base.handleOnExit();
        }
        if (oCustomExtension && oCustomExtension.isExecutionAfter(Constants.ON_EXIT)) {
            oCustomExtension.executeFunction(Constants.ON_EXIT);
        }
    };

    LifecycleExtension.prototype._getCustomExtension = function() {
        if (!this._oCustomExtension) {
            this._oCustomExtension = this.base.getCustomControllerExtension(this, Constants.EXTENSION_NAME);
        }
        return this._oCustomExtension;
    };

    return LifecycleExtension;
});