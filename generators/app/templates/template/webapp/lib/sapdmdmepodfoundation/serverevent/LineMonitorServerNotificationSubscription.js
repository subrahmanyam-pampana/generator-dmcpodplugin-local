sap.ui.define([
    "sap/dm/dme/podfoundation/serverevent/ServerNotificationSubscription",
    "sap/dm/dme/podfoundation/serverevent/LineMonitorNotificationConfig",
], function(ServerNotificationSubscription, LineMonitorNotificationConfig) {
    "use strict";

    return ServerNotificationSubscription.extend("sap.dm.dme.podfoundation.serverevent.LineMonitorServerNotificationSubscription", {

        constructor: function(oViewController) {
            ServerNotificationSubscription.call(this, oViewController, true);
        },

        _getNotificationConfiguration: function() {
            var oConfigData = this._getNotificationConfigurationData();
            var oNotificationConfig = new LineMonitorNotificationConfig(oConfigData);
            if (oNotificationConfig.addCustomTopics) {
                var aCustomEvents = this._getCustomNotificationEvents();
                if (aCustomEvents.length > 0) {
                    oNotificationConfig.addCustomTopics(aCustomEvents);
                }
            }
            return oNotificationConfig;
        }

    });
}, true);