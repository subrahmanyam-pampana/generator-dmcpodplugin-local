/**
 * Line Monitor notification configuration allowing only production process PP_ACTION.
 */
sap.ui.define([
    "sap/dm/dme/serverevent/NotificationConfig",
    "sap/dm/dme/serverevent/Topic"
], function(NotificationConfig, Topic) {
    "use strict";

    return NotificationConfig.extend("sap.dm.dme.podfoundation.serverevent.LineMonitorNotificationConfig", {

        constructor: function(mSettings) {
            var oSettings = mSettings ? mSettings : {};

            this._subscribeWorkCenter = !!oSettings.subscribeWorkCenter;
            this._productionProcessNotification = !!oSettings.productionProcessNotification;
            this._topics = this._addTopics(oSettings);
        },

        _addTopics: function(oSettings) {
            var aTopics = [];
            !!oSettings.productionProcessNotification &&
                aTopics.push(Topic.PP_ACTION);
            return aTopics;
        }
    });
}, true);