/**
 * Constants for LifecycleExtension
 */
sap.ui.define(function() {
    "use strict";

    return {

        /**
         * Name for the Lifecycle extension
         */
        EXTENSION_NAME: "lifecycleExtension",

        /**
         * This function by default sets up initial view model:
         * onBeforeRendering: function() {}
         */
        ON_BEFORE_RENDERING: "onBeforeRendering",

        /**
         * This function by default sets up initial view model:
         * onBeforeRenderingPlugin: function() {}
         */
        ON_BEFORE_RENDERING_PLUGIN: "onBeforeRenderingPlugin",

        /**
         * This function by default sets up initial view model:
         * onAfterRendering: function() {}
         */
        ON_AFTER_RENDERING: "onAfterRendering",

        /**
         * This function by default sets up initial view model:
         * onExit: function() {}
         */
        ON_EXIT: "onExit"
    };
});