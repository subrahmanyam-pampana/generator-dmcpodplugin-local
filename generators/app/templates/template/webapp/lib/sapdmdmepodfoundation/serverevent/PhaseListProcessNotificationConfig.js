/**
 * Order POD Phase List notification configuration allowing only production process PP_ACTION.
 */
sap.ui.define([
    "sap/dm/dme/serverevent/NotificationConfig",
    "sap/dm/dme/serverevent/Topic"
], function(NotificationConfig, Topic) {
    "use strict";

    return NotificationConfig.extend("sap.dm.dme.podfoundation.serverevent.PhaseListProcessNotificationConfig", {

        // Only subscribe to the production process PP_ACTION event. PP_START and PP_END are not needed and so we
        // don't want to create subscriptions for these.
        _addTopics: function(oNotificationConfigData) {
            let aTopics = [];
            !!oNotificationConfigData.productionProcessNotification &&
                aTopics.push(Topic.PP_ACTION);
            return aTopics;
        }
    });
});