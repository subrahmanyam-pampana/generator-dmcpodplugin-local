/**
 * @deprecated Use sap/base/Log instead
 * This class provides logging APIs, serving as a wrapper around the underlying logging implementation.
 */
sap.ui.define(["sap/base/Log"], function(Log) {
    "use strict";

    return {

        /**
         * Get the logger for the given component name. The logger inherits default logging level as
         * set by UI5. If debug sources are enabled then the DEBUG level is the default, otherwise
         * the ERROR level is used.
         *
         * For performance reasons it is best to cache the logger in a private variable in the containing module.
         * Multiple calls to getLogger that pass the same component name may return different logger instances.
         *
         * @param {string} sComponentName The component name of the logger. Specifies a logical category and is automatically included
         * in the output of each log message.
         * @throws {Error} If the component name is not specified or empty
         * @returns {object} The logger instance. May be a new instance even if getLogger was previously called with the
         * same component name.
         */
        getLogger: function(sComponentName) {
            jQuery.sap.assert(!!sComponentName, "You must specify a component name");

            let oLogger = Log.getLogger(sComponentName);

            return {

                /**
                 * Set the logging level.
                 * @param iLevel sap.base.Log.Level
                 */
                setLevel: function(iLevel) {
                    oLogger.setLevel(iLevel);
                },

                /**
                 * Log the given message and optional details using the DEBUG logging level.
                 *
                 * @param {string} sMsg The log message
                 * @param {string} sDetails Optional detailed information
                 */
                debug: function(sMsg, sDetails) {
                    oLogger.debug(sMsg, sDetails);
                },

                /**
                 * Log the given message and optional details using the INFO logging level.
                 *
                 * @param {string} sMsg The log message
                 * @param {string} sDetails Optional detailed information
                 */
                info: function(sMsg, sDetails) {
                    oLogger.info(sMsg, sDetails);
                },

                /**
                 * Log the given message and optional details using the WARNING logging level.
                 *
                 * @param {string} sMsg The log message
                 * @param {string} sDetails Optional detailed information
                 */
                warning: function(sMsg, sDetails) {
                    oLogger.warning(sMsg, sDetails);
                },

                /**
                 * Log the given message and optional details using the ERROR logging level.
                 *
                 * @param {string} sMsg The log message
                 * @param {string} sDetails Optional detailed information
                 */
                error: function(sMsg, sDetails) {
                    oLogger.error(sMsg, sDetails);
                }
            };
        }
    };
});