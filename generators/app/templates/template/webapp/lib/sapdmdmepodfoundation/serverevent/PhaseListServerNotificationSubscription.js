sap.ui.define([
    "sap/dm/dme/podfoundation/serverevent/ServerNotificationSubscription",
    "sap/dm/dme/podfoundation/serverevent/PhaseListProcessNotificationConfig"
], function(ServerNotificationSubscription, PhaseListProcessNotificationConfig) {
    "use strict";

    return ServerNotificationSubscription.extend("sap.dm.dme.podfoundation.serverevent.PhaseListServerNotificationSubscription", {

        // Override to enable group subscription support.
        constructor: function(oViewController) {
            ServerNotificationSubscription.call(this, oViewController, true);
        },

        // Override to only create the Notifications object and not subscribe to the PodSelectionChanged event. Phase
        // list loading triggers subscription update because subscriptions are based on phase planned work centers.
        init: function() {
            this._createNotificationsObject();
        },

        // Override to return the phase list specific PhaseListProcessNotificationConfig. PhaseListProcessNotificationConfig restricts
        // production process event subscriptions to only PP_ACTION.
        _getNotificationConfiguration: function() {
            let oConfigData = this._getNotificationConfigurationData();
            return new PhaseListProcessNotificationConfig(oConfigData);
        }
    });
});