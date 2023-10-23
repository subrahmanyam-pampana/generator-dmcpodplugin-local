sap.ui.define([
    "sap/ui/core/mvc/ControllerExtension",
    "sap/dm/dme/podfoundation/controller/extensions/NotificationExtensionConstants"
], function(ControllerExtension, Constants) {
    "use strict";

    /**
     * Base Constructor for a plugin Notificattion Extension
     * The following functions can be overridden by custom extensions:
     *<pre>
     *    isSubscribingToNotifications()
     *    getCustomNotificationEvents()
     *    getNotificationMessageHandler()
     * </pre>
     * @class
     * <code>sap.dm.dme.podfoundation.controller.extensions.NotificationExtension</code> provides
     * functions that handle defining Notification for a core plugin.  Custom extensions can
     * only be used to override core implementation.
     *
     * @extends sap.ui.core.mvc.ControllerExtension
     *
     * @constructor
     * @public
     * @alias sap.dm.dme.podfoundation.controller.extensions.NotificationExtension
     */
    let NotificationExtension = ControllerExtension.extend("sap.dm.dme.podfoundation.controller.extensions.NotificationExtension", {
        metadata: {
            methods: {
                isSubscribingToNotifications: {
                    "final": false,
                    "public": true
                },
                getCustomNotificationEvents: {
                    "final": false,
                    "public": true
                },
                getNotificationMessageHandler: {
                    "final": false,
                    "public": true
                }
            }
        }
    });

    /**
     * Returns whether or not this plugin is subscribing to notifications
     *
     * @see sap.dm.dme.podfoundation.controller.PluginViewController#isSubscribingToNotifications
     * @returns {boolean} false (default), true to enable notifications
     * @public
     */
    NotificationExtension.prototype.isSubscribingToNotifications = function() {
        let oCustomExtension = this._getCustomExtension();
        if (oCustomExtension) {
            return oCustomExtension.executeFunction(Constants.IS_SUBSCRIBING, null);
        }
        return false;
    };

    /**
     * Returns an array of string event names to subscribe to.
     * Event names must be between 4-24 characters in length,
     * start with a alphabetic character and contain only
     * alpha-numeric characters, no spaces and may include
     * _.- special characters.  If these conditions are not
     * met for an event name, the subscription for the event
     * will not be created and an error logged to the console.

     * @see sap.dm.dme.podfoundation.controller.PluginViewController#getCustomNotificationEvents
     * @returns {array} custom event names to subscribe to
     * @public
     */
    NotificationExtension.prototype.getCustomNotificationEvents = function() {
        let oCustomExtension = this._getCustomExtension();
        if (oCustomExtension) {
            return oCustomExtension.executeFunction(Constants.GET_NOTIFICATION_EVENTS, null);
        }
        return null;
    };

    /**
     * Returns the function to call when the notification for
     * the input event name is received.

     * @see sap.dm.dme.podfoundation.controller.PluginViewController#getNotificationMessageHandler
     * @param {string} sEvent is the name of the event (or topic) to get callback function for
     * @returns {function} function handler to call
     * @public
     */
    NotificationExtension.prototype.getNotificationMessageHandler = function(sEvent) {
        let oCustomExtension = this._getCustomExtension();
        if (oCustomExtension) {
            return oCustomExtension.executeFunction(Constants.GET_NOTIFICATION_HANDLER, [sEvent]);
        }
        return null;
    };

    NotificationExtension.prototype._getCustomExtension = function() {
        if (!this._oCustomExtension) {
            this._oCustomExtension = this.base.getCustomControllerExtension(this, Constants.EXTENSION_NAME);
        }
        return this._oCustomExtension;
    };

    return NotificationExtension;
});