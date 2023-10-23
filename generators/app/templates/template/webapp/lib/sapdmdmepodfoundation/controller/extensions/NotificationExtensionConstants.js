/**
 * Constants for NotificationExtension
 */
sap.ui.define(function() {
    "use strict";

    return {

        /**
         * Name for the Notification extension
         */
        EXTENSION_NAME: "notificationExtension",

        /**
         * This function by default sets up initial view model:
         * onBeforeRendering: function() {}
         */
        IS_SUBSCRIBING: "isSubscribingToNotifications",

        /**
         * This function by default sets up initial view model:
         * onBeforeRenderingPlugin: function() {}
         */
        GET_NOTIFICATION_EVENTS: "getCustomNotificationEvents",

        /**
         * This function by default sets up initial view model:
         * onAfterRendering: function() {}
         */
        GET_NOTIFICATION_HANDLER: "getNotificationMessageHandler"
    };
});